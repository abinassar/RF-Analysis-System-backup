import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PowerBudgetPageRoutingModule } from './power-budget-routing.module';

import { PowerBudgetPage } from './power-budget.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { AntennaListModule } from './components/antenna-list/antenna-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PowerBudgetPageRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    AntennaListModule
  ],
  declarations: [
    PowerBudgetPage
  ],
  providers: [
    ScreenOrientation
  ]
})
export class PowerBudgetPageModule {}
