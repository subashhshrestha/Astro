
import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, LoadingController } from 'ionic-angular';
import { SettingsProvider } from '../../providers/settings/settings';
import { Http } from '@angular/http';
import { InAppPurchase } from '@ionic-native/in-app-purchase';
import { Events, ActionSheetController, Content } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/toPromise';
import { AccountPage } from '../account/account';
import { Market } from '@ionic-native/market';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  data: any = null;
  askingQuestion: boolean = false;
  welcome_message: string;
  chatData: any;
  question: string;
  loading: boolean = false;
  loadingShow;
  current_rating: any;
  showWelcome: boolean = true;
  extraData:string = "";
  @ViewChild(Content) content: Content;
  constructor(public navCtrl: NavController, public settings: SettingsProvider, public http: Http, public events: Events, public storage: Storage, public iap: InAppPurchase, public actionCtrl: ActionSheetController, private market: Market, public modalCtrl: ModalController, private loadingCtrl: LoadingController) {
    this.loadStorageData();
    this.getSplashData();
  }

  changedRating(cur){
    this.current_rating = cur;
  }

  loadStorageData(){
    this.storage.get("chatData")
    .then(data=>{
      this.chatData = data;
      // this.showWelcome = true;
    });
    this.storage.get("splashData")
    .then(data=>{
      if(data){
        this.data = data;
        SettingsProvider.splash = this.data;
        this.welcome_message = this.data.body.welcome_message;
        this.extraData = this.data.body.first_msg;
        this.updatePrice();
        if(this.data.body.user_exists){
          SettingsProvider.free = 0;
          this.loading = false;
          SettingsProvider.isUser = false;
        }
        else{
          SettingsProvider.free = parseInt(this.data.body.is_free);
          SettingsProvider.isUser = true;
          SettingsProvider.userId = this.data.body.user_id;
          SettingsProvider.dob = this.data.body.date_of_birth;
          SettingsProvider.UserName = this.data.body.name;
          SettingsProvider.image = this.data.body.image_url;
          this.events.publish("user:registered", {});
          // this.loading = false;
        }
      }
    })
    .catch(err=>{
      this.settings.showErrorMessage(err, "Error Loading From Database");
    });
  }

  ratingChange(id){
    if(id=="")
      return 0;
    this.loading = true;
    let url = this.settings.getRequestUrl("rate/")+id;
    this.http.post(url, {user_id: SettingsProvider.userId, rate: this.current_rating}).toPromise()
    .then(data=>{
      data = data.json();
      if(data['status']['success']){
        this.settings.showErrorToast('Rating Saved');
      }
      else{
        this.settings.showErrorToast("Could Not save Rating. Please check internet connection");
      }
      this.loading = false;
    })
    .catch((err)=>{
      this.settings.showErrorMessage("Could Not save Rating.");
      this.loading = false;
    })
  }

  updatePrice(){
    if(!SettingsProvider.isUser){
      SettingsProvider.free = 0;
      this.events.publish("price:updated");
    }
    if(!SettingsProvider.free){
      SettingsProvider.displayPrice = "Paid Question";
      this.iap.getProducts([SettingsProvider.questionType])
      .then(products=>{
        SettingsProvider.price = products[0]['price'];
        this.events.publish("price:updated");
      })
      .catch(err=>{
        SettingsProvider.price = "3";
        this.events.publish("price:updated");
      });
    }
    else{
      SettingsProvider.displayPrice = "Free Question";
    }

  }
  private getSplashData() {
    if(this.settings.deviceId == null || SettingsProvider.gcmId == null || SettingsProvider.appVersion == null ){
      setTimeout(() => {
        this.getSplashData();
      }, 100);
      return;
    }

    this.storage.get("question")
    .then(q=>{
      this.question = q;
    });

    this.askingQuestion = false;
    this.loading = true;
    let data = {
      device_token: this.settings.getDeviceId(),
      gcm_id: SettingsProvider.gcmId,
      app_version: SettingsProvider.appVersion
    };
    this.settings.showDebugMessage(data, "DATA BEING SENT");
    this.http.post(this.settings.getRequestUrl("splash"), data)
    .toPromise()
    .then((data)=>{
      this.settings.showDebugMessage("Data sent to:", this.settings.getRequestUrl("splash"))
      this.data = data.json();
      this.settings.showDebugMessage(data, "DATA Received");
      
      if(this.data.body.upgrade == true){
        if(!SettingsProvider.hasUpdate){
          this.settings.alertCtrl.create({
            title: "New Version available!",
            message: "A new version of the app is available. Please update the app to continue",
            enableBackdropDismiss: false,
            buttons: [
              {
                text: "Later",
                handler: () =>{
                  this.storage.set("hasUpdate", true);
                }
              },
              {
                text: "Update",
                handler: ()=>{
                  this.market.open("com.knockoutsystem.astrorule");
                }
              }
            ]
          }).present();
          SettingsProvider.hasUpdate = true;
        }
        
      }
      SettingsProvider.free = parseInt(this.data.body.is_free);
      this.extraData = this.data.body.first_msg;
      this.updatePrice();
      if(typeof this.data.body.user_id == "undefined"){
        let m = this.modalCtrl.create(AccountPage);
        SettingsProvider.isUser = false;
        this.welcome_message = this.data.body.welcome_message;
        // this.showWelcome = true;
        SettingsProvider.splash = this.data;
        m.present();
        this.loading = false;
        return;
      }        
      this.storage.set('splashData', this.data);
      SettingsProvider.splash = this.data;
      this.welcome_message = this.data.body.welcome_message;
      if(typeof this.data.body['user_id'] == "undefined"){

        this.loading = false;
        SettingsProvider.isUser = false;
      }
      else{
        SettingsProvider.isUser = true;
        SettingsProvider.userId = this.data.body.user_id;
        SettingsProvider.dob = this.data.body.date_of_birth;
        SettingsProvider.UserName = this.data.body.name;
        SettingsProvider.image = this.data.body.image_url;
        this.events.publish("user:registered", {});
        this.loading = false;
        this.getChatData();
      }
      this.storage.get("question")
      .then(q=>{
        this.question = q;
      });
    })
    .catch( (err)=>{
      this.loading = false;
      this.settings.showErrorToast("Cound not access data. Please check network.");
      this.settings.showErrorMessage(err, "Error accessing Data");
      this.loadStorageData();
    } );
    
  }

  getChatData(){
    let url = this.settings.getRequestUrl("chat") + "/" + SettingsProvider.userId;
    this.http.get(url).toPromise().then((data)=>{
      let d = data.json();
      this.chatData = d.body;
      this.storage.set("chatData", d.body);
      // this.loading = false;
      setTimeout(() => {
        this.content.scrollToBottom(300);//300ms animation speed
      });
    }).
    catch((error)=>{
      // this.loading = false;
      this.loadStorageData();
    })
  }

  askQuestion(){
    // ask to pay if question price is not 0;
    this.storage.set("question", this.question);
    if(!SettingsProvider.isUser){
      this.settings.alertCtrl.create({
        cssClass: "regsiter",
        message: "Please register first",
        buttons: [
          {
            text: "Later"
          },
          {
            text: "Register",
            handler: () =>{
              this.modalCtrl.create(AccountPage).present();
            }
          }
        ]
      })
      .present();
      return;
    }
    this.askingQuestion = true;

    if(!SettingsProvider.free)
      this.askIapQuestion();
    else{
      this.http.post(this.settings.getRequestUrl("question"), {userid: SettingsProvider.userId, question: this.question, transaction_id: "free"})
      .toPromise()
      .then((data)=>{
        data = data.json();
        if(data['status']['success']){
          this.question = "";
          this.storage.set("question", this.question);
          this.resizeTextarea();
          this.getSplashData();
        }
        else{
          this.resizeTextarea();
          this.getSplashData();
          this.settings.showErrorToast("Error Processing Question.")
        }
      })
      .catch((err)=>{
        this.settings.showErrorMessage(err, "Error getting question")
      });
    }
      
  }

  askIapQuestion(){
    console.log("Asking IAP");
    this.loadingShow = this.loadingCtrl.create({
      content: "Processing.. Please wait.",
      dismissOnPageChange: true
    });
    this.loadingShow.present();
    this.iap.getProducts([SettingsProvider.questionType])
    .then(products=>{
      this.iap.buy(SettingsProvider.questionType)
      .then(d=>{
        this.loadingShow.dismiss();
        this.http.post(this.settings.getRequestUrl("question"), {userid: SettingsProvider.userId, question: this.question, transaction_id: d.receipt})
        .toPromise()
        .then((data)=>{
          data = data.json();
          this.data.showDebugMessage("Data Recived", data);
          if(data['status']['success']){
            this.question = "";
            this.storage.set("question", this.question);
            this.resizeTextarea();
            this.getSplashData();
            this.iap.consume(d.productType, d.receipt, d.signature)
            .then(d=>this.settings.showDebugMessage(d, "Question sent"))
            .catch(err=>{
              this.http.post(this.settings.getRequestUrl("logs"),{device_token: this.settings.getDeviceId(), description:JSON.stringify(err)});
              this.settings.showErrorMessage(err, "Question asking error");
            });
          }
          else{
            this.resizeTextarea();
            this.getSplashData();
            this.settings.showErrorToast("Error Processing Question.")
          }
        })
        .catch((err)=>{

          this.resizeTextarea();
          this.getSplashData();
          this.askingQuestion = false;

          this.settings.showErrorMessage(err, "POST Error")
        });
      })
      .catch(err=>{
        this.loadingShow.dismiss();
        this.askingQuestion = false;
        console.error("Buy Error:"+JSON.stringify(err));
        this.iap.restorePurchases()
        .then(p=>{
          this.askingQuestion = false;
          this.iap.consume(p[p.length-1].productType, p[p.length -1].receipt, p[p.length -1].signature)
          .catch(err=>this.settings.showErrorMessage(err, "Consumption Error", true) );
        })
        .catch(err=>{
          this.settings.showErrorMessage(err, "Purchase Restore Error", true)
          this.askingQuestion = false;
        });
        this.settings.showErrorToast("Purchase Unsuccessful.")
      });
    })
    .catch(err=>{
      this.askingQuestion = false;
      this.settings.showErrorToast("Please check that you are connected to the internet");
    })
  }

  resizeTextarea(){
    let charLimit = 250;
    if(this.question.length > charLimit){
      this.question = this.question.substring(0, charLimit);
      this.settings.showErrorToast("Only "+charLimit+" characters allowed");
    }

    let q =  document.getElementById("question");
    q.style.height = "0px";
    q.style.height = q.scrollHeight+ "px";
  }
}