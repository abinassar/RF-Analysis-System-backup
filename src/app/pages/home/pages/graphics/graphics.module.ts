import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GraphicsPage } from './graphics.page';

import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { GraphicsPageRoutingModule } from './graphics-routing.module';
import { ElevationProfileComponent,
         AtenuationWaterVaporGraphComponent,
         AtenuationGraphComponent } from './components';
import { MapPageModule } from '../map/map.module';
import { SharedModule } from '@shared/shared.module';
PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PlotlyModule,
    GraphicsPageRoutingModule,
    ReactiveFormsModule,
    MapPageModule,
    SharedModule
  ],
  declarations: [
    GraphicsPage,
    ElevationProfileComponent,
    AtenuationGraphComponent,
    AtenuationWaterVaporGraphComponent,
  ]
})
export class GraphicsPageModule {}
