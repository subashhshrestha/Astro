import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AppVersion } from '@ionic-native/app-version';
import { AlertController, ToastController } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';

/*
  Generated class for the SettingsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SettingsProvider {

  public deviceId: string;
  public requestUrl: string;
  public static splash: any = null;
  public static UserName: string = "Astrorule";
  public static image: string = "assets/icon/favicon.ico";
  public static defaultImage: string = "assets/images/app-icon.png";
  public static isUser: boolean = false; 
  public static userId: number = 0;
  public static push: any;
  public static gcmId: string;
  public static free: number = 0;
  public static dob: string;
  public static appVersion: string; 
  public static hasUpdate: boolean = false;
  public static displayPrice: string = "Paid Question";
  public static questionType = "astrorule_question";
  public static price: any;

  constructor(public http: Http, public version: AppVersion, public alertCtrl: AlertController, public toastCtrl: ToastController, public firebase: Firebase ) {
    // this.requestUrl = "https://knockoutsystem.com.np/astrorule/apis/public/api/";
    // this.requestUrl = "http://192.168.1.71/astrorule/apis/public/api/";
    this.requestUrl = "https://astrorule.com/apis/public/api/"
  }

  setDeviceId(id){
    this.deviceId = id;
  }
  
  getDeviceId(){
    return this.deviceId;
  }

  getRequestUrl(append){
    return this.requestUrl+append;
  }

  getAppVersion(){
    this.version.getVersionNumber()
    .then(data=>{
      SettingsProvider.appVersion = data;
    })
  }

  showErrorMessage(e: any, message: string ="", report:boolean = false){
    console.error(message, e);
    if(report){
      this.http.post(this.requestUrl+'logs', {device_token:this.deviceId, description: message+":"+JSON.stringify(e)});
    }
  }

  showDebugMessage(o: any = "", message: string =""){
    console.log(message, o);
  }

  showErrorToast(message: string){
    this.toastCtrl.create({
      message: message,
      duration: 3000,
      dismissOnPageChange: true
    }).present()
  }

  showAlertMessage(message: string){
    this.alertCtrl.create({
      message: message,
      buttons: ['Dismiss']
    }).present();
  }

}
