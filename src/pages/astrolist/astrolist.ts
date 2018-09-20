import { Component } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { Http } from '@angular/http';
import { SettingsProvider } from '../../providers/settings/settings';
import { Storage } from "@ionic/storage";
import { ViewController } from 'ionic-angular/navigation/view-controller';

@Component({
  selector: 'page-astrolist',
  templateUrl: 'astrolist.html',
})
export class AstrolistPage {
  astrolist: Array<{name: string, image: string, about: string}>;
  loading: any;

  constructor(public http: Http, public settings: SettingsProvider, public loadingCtrl: LoadingController, public storage: Storage, private viewCtrl: ViewController) {
    this.loadAstroList();
  }

  loadAstroList(){
    this.storage.get('astrolistData')
    .then((data)=>{
      if(data){
        this.astrolist = data['body'];
      }
      else{
        this.getAstroList();
      }
    }).catch((err)=>{
      this.settings.showErrorMessage(err, "Astrolist Storage Error");
      this.getAstroList();
    })
  }

  async doRefresh(refresher){
    await this.getAstroList();
    refresher.complete();
  }

  async getAstroList(){
    this.loading = this.loadingCtrl.create({
      content: ""
    });
    this.loading.present();
    await this.http.get(this.settings.getRequestUrl("astrologer"))
    .toPromise()
    .then((data)=>{
      data = data.json();
      this.astrolist = data['body'];
      this.storage.set('astrolistData', data);
      this.loading.dismiss();
    })
    .catch(err=>{
      this.settings.showErrorMessage(err, "Error getting Astro Data")
    })
  }

  closeView(){
    this.viewCtrl.dismiss();
  }

}
