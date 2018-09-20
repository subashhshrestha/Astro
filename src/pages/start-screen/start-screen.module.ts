import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StartScreenPage } from './start-screen';

@NgModule({
  declarations: [
    StartScreenPage,
  ],
  imports: [
    IonicPageModule.forChild(StartScreenPage),
  ],
})
export class StartScreenPageModule {}
