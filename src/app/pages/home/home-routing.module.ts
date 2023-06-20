import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
    children: [
      {
        path: 'map',
        loadChildren: () => import('./pages/map/map.module').then( m => m.MapPageModule)
      },
      {
        path: 'graphics',
        loadChildren: () => import('./pages/graphics/graphics.module').then( m => m.GraphicsPageModule)
      },
      {
        path: 'compass',
        loadChildren: () => import('./pages/compass/compass.module').then( m => m.CompassPageModule)
      },
      {
        path: '',
        redirectTo: '/home/map',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/home/map',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}




