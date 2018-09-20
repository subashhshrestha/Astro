import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { SettingsProvider } from '../../providers/settings/settings';
import { Storage } from "@ionic/storage";
import { ViewController } from 'ionic-angular/navigation/view-controller';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
  aboutus: string;
  image: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http, public settings: SettingsProvider, public storage: Storage, private viewCtrl: ViewController) {
    this.loadAboutData();
  }

  loadAboutData(){
    this.storage.get('aboutData')
    .then((d)=>{
      if(d){
        this.aboutus = d.body.data;
        this.image = d.body.image;
      }
      else{
        this.getAboutData();
      }
    }).catch((err)=>{
      this.settings.showErrorMessage(err, "Load Data in About Page");
      this.getAboutData();
    });
  }

  async getAboutData(){
    await this.http.get(this.settings.getRequestUrl("aboutus"))
    .toPromise()
    .then((data)=>{
      let d = data.json();
      this.aboutus = d.body.data;
      this.image = d.body.image;
      this.storage.set('aboutData', d);
    })
    .catch(err=>console.log(err));
  }

  async doRefresh(refresher){
    await this.getAboutData();
    refresher.complete();
  }

  closeView(){
    this.viewCtrl.dismiss();
  }

}
