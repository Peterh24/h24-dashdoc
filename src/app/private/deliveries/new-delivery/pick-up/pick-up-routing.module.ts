import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickUpPage } from './pick-up.page';

const routes: Routes = [
  {
    path: '',
    component: PickUpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickUpPageRoutingModule {}
