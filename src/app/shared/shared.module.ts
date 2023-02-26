import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntennaListComponent } from './components/antenna-list/antenna-list.component';
import { IonicModule } from '@ionic/angular';
import { LinkConfigurationComponent } from './components/link-configuration/link-configuration.component';

@NgModule({
  declarations: [
    AntennaListComponent,
    LinkConfigurationComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    AntennaListComponent
  ]
})
export class SharedModule { }
