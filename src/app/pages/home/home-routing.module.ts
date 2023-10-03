import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { SessionGuard } from '@core/guards';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule),
        canActivate: [SessionGuard]
      },
      {
        path: 'map',
        loadChildren: () => import('./pages/map/map.module').then( m => m.MapPageModule),
        canActivate: [SessionGuard]
      },
      {
        path: 'graphic',
        loadChildren: () => import('./pages/graphic/graphic.module').then( m => m.GraphicPageModule),
        canActivate: [SessionGuard]
      },
      {
        path: 'graphics',
        loadChildren: () => import('./pages/graphics/graphics.module').then( m => m.GraphicsPageModule),
        canActivate: [SessionGuard]
      },
      {
        path: 'power-budget',
        loadChildren: () => import('./pages/power-budget/power-budget.module').then( m => m.PowerBudgetPageModule),
        canActivate: [SessionGuard]
      },
      {
        path: '',
        redirectTo: '/home/dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/home/dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}




