import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapboxPageRoutingModule } from './mapbox-routing.module';

import { MapboxPage } from './mapbox.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapboxPageRoutingModule
  ],
  declarations: [MapboxPage]
})
export class MapboxPageModule {}
