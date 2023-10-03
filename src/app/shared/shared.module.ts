import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GlobalMapComponent } from './components/global-map/global-map.component';
import { TruncatePipe } from './pipes';
import { OptionsModalComponent } from './components/options-modal/options-modal.component';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { LinkSettingsComponent } from './components/link-settings/link-settings.component';
import { ReactiveFormsModule } from '@angular/forms';

import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyGraphicComponent } from './components/plotly-graphic/plotly-graphic.component';
PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  declarations: [
    GlobalMapComponent,
    TruncatePipe,
    OptionsModalComponent,
    LinkSettingsComponent,
    PlotlyGraphicComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    PlotlyModule
  ],
  exports: [
    GlobalMapComponent,
    TruncatePipe,
    OptionsModalComponent,
    PlotlyGraphicComponent
  ],
  providers: [
    ScreenOrientation
  ]
})
export class SharedModule { }
