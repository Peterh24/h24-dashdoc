import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailDeliveryPage } from './detail-delivery.page';

const routes: Routes = [
  {
    path: '',
    component: DetailDeliveryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailDeliveryPageRoutingModule {}
