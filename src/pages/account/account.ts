import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, LoadingController, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { ImagePicker } from '@ionic-native/image-picker';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

import { Device } from '@ionic-native/device'
import { SettingsProvider } from '../../providers/settings/settings';
import { Camera } from '@ionic-native/camera';
import { ViewController } from 'ionic-angular/navigation/view-controller';

@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage {
  data: any;
  image: any;
  name: string;
  email: string;
  gender: string;
  dob: string;
  tob: string;
  time_accuracy: boolean;
  country: string;
  state: string;
  fileUploaded: boolean = false;
  loading: any;
  tooltip: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public settings: SettingsProvider, public http: Http, public imgpkr: ImagePicker, public transfer: FileTransfer, public actionsheetCtrl: ActionSheetController, public camera: Camera, public loadingCtrl: LoadingController, public events: Events, private device: Device, public viewCtrl: ViewController) {
    this.loadData();
  }

  tooltipchange(e){
    if(e)
      this.tooltip = "My birth time is accurate";
    else
      this.tooltip = "My birth time is not accurate";
  }

  loadData(){
    this.loading = this.loadingCtrl.create({
      content: ""
    });
    this.loading.present();
    if( !SettingsProvider.isUser ){
      this.image = SettingsProvider.defaultImage;
      this.name = "";
      this.email = "";
      this.gender = "";
      this.dob = "";
      this.tob = "";
      this.time_accuracy = false;
      this.country = "";
      this.state = "";
    }
    else{
      let data = SettingsProvider.splash.body;
      this.image = data.image_url;
      this.name = data.name;
      this.email = data.email;
      this.gender = data.gender;
      this.dob = data.date_of_birth;
      this.tob = data.time_of_birth;
      if(data.time_accuracy == "1")
        this.time_accuracy = true;
      else
        this.time_accuracy = false;
      this.country = data.country;
      this.state = data.location;
    }
    this.loading.dismiss();
  }

  photoOptions(){
    this.actionsheetCtrl.create({
      title: "Camera or Gallery?",
      buttons:[
        {
          text: "Camera",
          handler: ()=>{
            this.clickPhoto();
          }
        },
        {
          text: "Gallery",
          handler: ()=>{
            this.selectImage();
          }
        }
      ]
    }).present();
  }

  clickPhoto(){
    this.camera.getPicture({correctOrientation: true})
    .then((result)=>{
      this.image = result;
      console.log(this.image);
      this.fileUploaded = true;
    })
    .catch((err)=>{
      this.settings.showErrorMessage(err, "Click Photo Error");
    })
  }

  selectImage(){
    this.imgpkr.hasReadPermission().then(()=>{
      this.imgpkr.getPictures({maximumImagesCount:1})
      .then((result)=>{
        if(result[0] && result[0]!="O"){ 
          this.image = result[0];
          this.fileUploaded = true;
        }       
      })
      .catch((err)=>{
        this.settings.showErrorMessage(err, "ImagePicker Get Photos Error");
      })
    })
    .catch(err=>{
      this.settings.showErrorMessage(err, "Gallery Permission Error");
    })
    
  }

  submitForm(){
    this.loading = this.loadingCtrl.create({
      content: "Saving Data..."
    });
    this.loading.present();

    // data validation
    let valid = true;
    if(this.name=="" || this.country=="" || this.dob=="" || this.gender=="" || this.email=="" || this.state ==""){
      valid = false;
    }
    if(!valid){
      this.loading.dismiss();
      this.settings.showErrorToast('All fields are required');
      return 0;
    }

    let data = {
      device_token: this.settings.getDeviceId(), 
      name: this.name, 
      country: this.country,
      date_of_birth:this.dob, 
      time_of_birth: this.tob,
      time_accuracy: (this.time_accuracy)?"1":"0",
      gender: this.gender,
      email: this.email,
      device_type: this.device.platform, // todo. check device type and send accordingly
      location: this.state,
      gcm_id: (SettingsProvider.gcmId=="")?"NoGCMid":SettingsProvider.gcmId
    };
    let url = this.settings.getRequestUrl("profile");
    this.settings.showDebugMessage(data, "Sending Data to:"+url);
    if(SettingsProvider.isUser){
      url += "/"+SettingsProvider.userId;
    }
    // check if file is uploaded and use the required option of http or file
    if(this.fileUploaded){
      const filetransfer: FileTransferObject = this.transfer.create();
      let options: FileUploadOptions = {
        fileKey: "image",
        params: data
      }
      filetransfer.upload(this.image, url, options)
      .then((data)=>{
        let d = JSON.parse(data.response);
        if(d.status.success){
          this.data = d;
          this.fileUploaded = false;
          SettingsProvider.splash = this.data;
          console.log(JSON.stringify(this.data));
          SettingsProvider.isUser = true;
          SettingsProvider.userId = this.data.body.user_id;
          SettingsProvider.dob = this.data.body.date_of_birth;
          SettingsProvider.UserName = this.data.body.name;
          SettingsProvider.image = this.data.body.image_url;
          this.events.publish("user:registered", {});
          this.settings.showErrorToast("Data saved Successfully");
        }
        else{
          SettingsProvider.isUser = false;
          let error = JSON.parse(d.status.jsonInfo);
          let k = Object.keys(error);
          error = error[k[0]];
          this.settings.showErrorToast(error);
        }
        this.loading.dismiss();
      })
      .catch((err)=>{
        this.settings.showErrorToast('Data could not be saved');
        this.loading.dismiss();
        this.settings.showErrorMessage(err, "Data upload Error");
      })
    }
    else{
      this.http.post(url, data ).toPromise()
      .then((data)=>{
        let d = data.json();
        if(d.status.success){
          this.data = d;
          this.fileUploaded = false;
          SettingsProvider.splash = this.data;
          console.log(JSON.stringify(this.data));
          SettingsProvider.isUser = true;
          SettingsProvider.userId = this.data.body.user_id;
          SettingsProvider.dob = this.data.body.date_of_birth;
          SettingsProvider.UserName = this.data.body.name;
          SettingsProvider.image = this.data.body.image_url;
          this.events.publish("user:registered", {});
          this.settings.showErrorToast('Data saved successfully');
        }
        else{
          SettingsProvider.isUser = false;
          let error = JSON.parse(d.status.jsonInfo);
          let k = Object.keys(error);
          error = error[k[0]];
          this.settings.showErrorToast('Data saved successfully');
        }
        this.loading.dismiss();
      })
      .catch((err)=>{
        this.settings.showErrorToast('Data could not be saved');
        this.loading.dismiss();
      });
    }
  }

  closeView(){
    this.viewCtrl.dismiss();
  }

}
