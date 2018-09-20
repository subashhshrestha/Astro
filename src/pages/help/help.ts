import { Component } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { Http } from '@angular/http';
import { SettingsProvider } from '../../providers/settings/settings';
import { Storage } from "@ionic/storage";
import { ViewController } from 'ionic-angular/navigation/view-controller';

@Component({
  selector: 'page-help',
  templateUrl: 'help.html',
})
export class HelpPage {
  image: string;
  info: string;
  questions: Array<{title: string, info: string}>;
  loading: any;
  constructor(public http: Http, public settings: SettingsProvider, public loadingCtrl: LoadingController, public storage: Storage, private viewCtrl: ViewController) {

    this.loadHelpData();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HelpPage');
  }

  loadHelpData(){
    this.storage.get('helpData')
    .then((data)=>{
      if(data){
        this.image = data['body']['image'];
        this.info = data['body']['data']['info'];
        this.questions = data['body']['data']['question'];
      }
      else{
        this.getHelpData();
      }
    }).catch((err)=>{
      this.settings.showErrorMessage(err, "Error getting Help Storage Data");
      this.getHelpData();
    });
  }

  async getHelpData(){
    this.loading = this.loadingCtrl.create({
      content: ""
    });
    this.loading.present();
    await this.http.get(this.settings.getRequestUrl("help"))
    .toPromise()
    .then((data)=>{
      data = data.json();
      this.image = data['body']['image'];
      this.info = data['body']['data']['info'];
      this.questions = data['body']['data']['question'];
      this.storage.set('helpData', data);
      this.loading.dismiss();
    })
    .catch(err=>{
      this.settings.showErrorMessage(err,"Error getting Help Data online")
    })
  }

  async doRefresh(refresher){
    await this.getHelpData();
    refresher.complete();
  }

  closeView(){
    this.viewCtrl.dismiss();
  }

}
