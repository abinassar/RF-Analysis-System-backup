import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CompassPageRoutingModule } from './compass-routing.module';

import { CompassPage } from './compass.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompassPageRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [
    CompassPage
  ],
  providers: [
    ScreenOrientation
  ]
})
export class CompassPageModule {}
