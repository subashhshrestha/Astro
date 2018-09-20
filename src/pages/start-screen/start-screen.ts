import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { HomePage } from '../home/home';

/**
 * Generated class for the StartScreenPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-start-screen',
  templateUrl: 'start-screen.html',
})
export class StartScreenPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage) {
  }

  getStarted(){
    this.storage.set("firstComplete", true)
    this.navCtrl.setRoot(HomePage);
  }
}
