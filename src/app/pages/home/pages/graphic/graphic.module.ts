import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GraphicPageRoutingModule } from './graphic-routing.module';

import { GraphicPage } from './graphic.page';
import { PlotlyGraphicComponent } from '@shared/components/plotly-graphic/plotly-graphic.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GraphicPageRoutingModule,
    SharedModule
  ],
  declarations: [
    GraphicPage
  ]
})
export class GraphicPageModule {}
