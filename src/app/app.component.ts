import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController, Events, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Device } from '@ionic-native/device';
import { Firebase } from '@ionic-native/firebase';
import { HomePage } from '../pages/home/home';
import { AboutPage } from '../pages/about/about';
import { AstrolistPage } from '../pages/astrolist/astrolist';
import { HelpPage } from '../pages/help/help';
import { AccountPage } from '../pages/account/account';
import { SettingsProvider } from '../providers/settings/settings';
import { InAppPurchase } from '@ionic-native/in-app-purchase';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { Storage } from '@ionic/storage';
import { Market } from '@ionic-native/market';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any;
  userImage: string = SettingsProvider.image;
  pages: Array<{title: string, component: any, image: string}>;
  roots: Array<{title: string, component: any, image: string}>;
  dob = ""; 
  clientname: string = "Astrorule";
  backButtonPressedOnceToExit = false;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public device: Device, public settings: SettingsProvider, public menuCtrl: MenuController, public events: Events, public firebase: Firebase, public toast: ToastController, public iap: InAppPurchase, private modalCtrl: ModalController, private storage: Storage, public market: Market) {

    events.subscribe('user:registered',()=>{
      this.userImage = SettingsProvider.image;
      this.dob = SettingsProvider.dob;
      this.clientname = SettingsProvider.UserName;
    });

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'About', component: AboutPage, image: "assets/images/about-icon.png" },
      { title: 'Astrologer List', component: AstrolistPage, image: "assets/images/astrologer-list-icon.png" },
      { title: 'Help', component: HelpPage, image: "assets/images/help-icon.png" },
      { title: 'My Account', component: AccountPage, image: "assets/images/about-icon.png" }
    ];
    this.roots = [
      { title: 'Home', component: HomePage, image: "assets/images/home-icon.png"}
    ];
    this.platform.ready().then(()=>{
      this.getDeviceId();
    })
  }

  initializeApp() {
    this.platform.ready().then(() => {
      
      this.statusBar.backgroundColorByHexString('#e69506');
      this.statusBar.styleLightContent();
      this.pushSetup();
      this.splashScreen.hide();
    });
  }

  pushSetup(){
    this.firebase.getToken()
    .then(token => {
      SettingsProvider.push = token;
      SettingsProvider.gcmId = token;
    }) // save the token server-side and use it to push notifications to this device
    .catch(error => console.error('Error getting token', error));
    this.firebase.onNotificationOpen()
    .subscribe((notification)=>{
      if(typeof(notification['message'])!=="undefined"){
        this.settings.showAlertMessage(notification['message']);
      }
    });
  }

  public get price(): string{
    return SettingsProvider.displayPrice;
  }

  openPage(page) {
    this.modalCtrl.create(page.component).present();
  }

  openPageAsRoot(page){
    this.nav.setRoot(page.component);
  }

  openAccount(){
    this.modalCtrl.create(AccountPage).present();
  }

  getDeviceId(){
    // this.settings.setDeviceId("1552");
    // this.initializeApp();
      
    this.storage.get('firstComplete')
    .then((data)=>{
      if(data == null || !data){
        this.rootPage = "StartScreenPage";
      }
      else{
        this.rootPage = HomePage;
      }
    })
    .catch((err)=>{
      this.settings.showErrorMessage(err, "First Complete Error")
      this.rootPage = "StartScreenPage";
    });

    this.storage.get('hasUpdate')
    .then((hasUpdate)=>{
      SettingsProvider.hasUpdate = hasUpdate;
    })
    .catch(err=>{
      this.settings.showErrorMessage(err, "hasUpdate Error");
    })
    this.settings.setDeviceId(this.device.uuid);
    this.settings.getAppVersion();
    this.initializeApp();
  }

  
  public get hasUpdate() : boolean {
    return SettingsProvider.hasUpdate;
  }

  public update(){
    this.market.open("com.knockoutsystem.astrorule");
  }
  
  
}
