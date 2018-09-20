import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Device } from '@ionic-native/device';
import { HttpModule } from "@angular/http";
import { Firebase } from '@ionic-native/firebase';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { AboutPage } from '../pages/about/about';
import { AstrolistPage } from '../pages/astrolist/astrolist';
import { HelpPage } from '../pages/help/help';
import { AccountPage } from '../pages/account/account';

import { IonicStorageModule } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SettingsProvider } from '../providers/settings/settings';
import { Ionic2RatingModule } from 'ionic2-rating';
import { ImagePicker } from '@ionic-native/image-picker';
import { FileTransfer} from '@ionic-native/file-transfer';
import { Camera } from '@ionic-native/camera';
import { InAppPurchase } from '@ionic-native/in-app-purchase';
import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    AboutPage,
    AstrolistPage,
    HelpPage,
    AccountPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    Ionic2RatingModule,
    IonicStorageModule.forRoot(),
    BrowserAnimationsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AboutPage,
    AstrolistPage,
    HelpPage,
    AccountPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Device,
    SettingsProvider,
    Firebase,
    ImagePicker,
    FileTransfer,
    Camera,
    InAppPurchase,
    AppVersion,
    Market
  ]
})
export class AppModule {}
