import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { SessionGuard } from '@core/guards';

const routes: Routes = [
  {
    path: 'sign-in',
    loadChildren: () => import('./pages/sign-in/sign-in.module').then( m => m.SignInPageModule),
    // canDeactivate: [SessionGuard]
  },
  {
    path: 'register-user',
    loadChildren: () => import('./pages/register-user/register-user.module').then( m => m.RegisterUserPageModule),
    // canDeactivate: [SessionGuard]
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule),
    // canDeactivate: [SessionGuard]
  },
  {
    path: 'verify-email-address/:email',
    loadChildren: () => import('./pages/verify-email-address/verify-email-address.module').then( m => m.VerifyEmailAddressPageModule),
    // canDeactivate: [SessionGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
    canActivate: [SessionGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/home/pages/dashboard/dashboard.module').then( m => m.DashboardPageModule),
    canActivate: [SessionGuard]
  },
  {
    path: '',
    redirectTo: '/home/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'graphic',
    loadChildren: () => import('./pages/home/pages/graphic/graphic.module').then( m => m.GraphicPageModule)
  }


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
