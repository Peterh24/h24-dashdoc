import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TransportsPage } from './transports.page';

const routes: Routes = [
  {
    path: '',
    component: TransportsPage
  },
  {
    path: 'checkout-delivery',
    loadChildren: () => import('./checkout-delivery/checkout-delivery.module').then( m => m.CheckoutDeliveryComponentModule)
  },
  {
    path: 'new-order',
    loadChildren: () => import('./new-order/new-order.module').then( m => m.NewOrderPageModule)
  },
  {
    path: 'basket',
    loadChildren: () => import('./basket/basket.module').then( m => m.BasketPageModule)
  },
  {
    path: 'detail/:id',
    loadChildren: () => import('./detail/detail.module').then( m => m.DetailPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveriesPageRoutingModule {}
