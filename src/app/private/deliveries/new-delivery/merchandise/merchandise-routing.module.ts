import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MerchandisePage } from './merchandise.page';

const routes: Routes = [
  {
    path: '',
    component: MerchandisePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchandisePageRoutingModule {}
