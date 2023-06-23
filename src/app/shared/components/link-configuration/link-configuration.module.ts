import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntennaListComponent } from '../antenna-list/antenna-list.component';
import { AntennaListModule } from '../antenna-list/antenna-list.module';
import { LinkConfigurationComponent } from './link-configuration.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [
    LinkConfigurationComponent
  ],
  imports: [
    CommonModule,
    AntennaListModule,
    IonicModule
  ],
  exports: [
    LinkConfigurationComponent
  ]
})
export class LinkConfigurationModule { }
