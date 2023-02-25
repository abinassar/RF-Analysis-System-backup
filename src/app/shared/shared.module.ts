import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntennaListComponent } from './components/antenna-list/antenna-list.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    AntennaListComponent
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
