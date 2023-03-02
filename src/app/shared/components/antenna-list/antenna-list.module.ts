import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntennaListComponent } from './antenna-list.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AntennaListComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
  exports: [
    AntennaListComponent
  ]
})
export class AntennaListModule { }
