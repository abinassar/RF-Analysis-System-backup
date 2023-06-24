import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GraphicsPage } from './graphics.page';
import { ElevationProfileComponent,
         AtenuationGraphComponent,
         AtenuationWaterVaporGraphComponent } from './components';

const routes: Routes = [
  {
    path: '',
    component: GraphicsPage,
  },
  {
    path: 'elevation-profile',
    component: ElevationProfileComponent
  },
  {
    path: 'atenuation-graph',
    component: AtenuationGraphComponent
  },
  {
    path: 'atenuation-water-vapor-graph',
    component: AtenuationWaterVaporGraphComponent
  },
  {
    path: '',
    redirectTo: '/home/graphics',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GraphicsPageRoutingModule {}
