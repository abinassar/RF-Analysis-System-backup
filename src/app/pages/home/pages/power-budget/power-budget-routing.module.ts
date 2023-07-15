import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PowerBudgetPage } from './power-budget.page';

const routes: Routes = [
  {
    path: '',
    component: PowerBudgetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PowerBudgetPageRoutingModule {}
