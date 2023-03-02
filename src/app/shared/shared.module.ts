import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LinkConfigurationComponent } from './components/link-configuration/link-configuration.component';
import { LinkConfigurationModule } from './components/link-configuration/link-configuration.module';
import { AntennaListModule } from './components/antenna-list/antenna-list.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    IonicModule,
    LinkConfigurationModule,
    AntennaListModule
  ],
  exports: [
  ]
})
export class SharedModule { }
