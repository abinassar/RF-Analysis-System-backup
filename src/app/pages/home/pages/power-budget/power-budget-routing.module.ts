import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PowerBudgetPage } from './power-budget.page';
import { AntennaListComponent } from './components/antenna-list/antenna-list.component';

const routes: Routes = [
  {
    path: '',
    component: PowerBudgetPage
  },
  {
    path: 'antenna-list',
    component: AntennaListComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PowerBudgetPageRoutingModule {}
