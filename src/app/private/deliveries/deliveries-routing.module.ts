import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveriesPage } from './deliveries.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveriesPage
  },
  {
    path: 'new-delivery',
    loadChildren: () => import('./new-delivery/new-delivery.module').then( m => m.NewDeliveryPageModule)
  },
  {
    path: 'detail-delivery/:id',
    loadChildren: () => import('./detail-delivery/detail-delivery.module').then( m => m.DetailDeliveryPageModule)
  },
  {
    path: 'checkout-delivery',
    loadChildren: () => import('./checkout-delivery/checkout-delivery.module').then( m => m.CheckoutDeliveryComponentModule)
  },
  {
    path: 'new-order',
    loadChildren: () => import('./new-order/new-order.module').then( m => m.NewOrderPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveriesPageRoutingModule {}
