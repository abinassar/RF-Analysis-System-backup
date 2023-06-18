import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapboxPage } from './mapbox.page';

const routes: Routes = [
  {
    path: '',
    component: MapboxPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapboxPageRoutingModule {}
