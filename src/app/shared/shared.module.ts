import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LinkConfigurationComponent } from './components/link-configuration/link-configuration.component';
import { LinkConfigurationModule } from './components/link-configuration/link-configuration.module';
import { AntennaListModule } from './components/antenna-list/antenna-list.module';
import { GlobalMapComponent } from './components/global-map/global-map.component';

@NgModule({
  declarations: [
    GlobalMapComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    LinkConfigurationModule,
    AntennaListModule
  ],
  exports: [
    GlobalMapComponent
  ]
})
export class SharedModule { }
