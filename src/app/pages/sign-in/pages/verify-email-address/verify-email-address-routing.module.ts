import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerifyEmailAddressPage } from './verify-email-address.page';

const routes: Routes = [
  {
    path: '',
    component: VerifyEmailAddressPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerifyEmailAddressPageRoutingModule {}
