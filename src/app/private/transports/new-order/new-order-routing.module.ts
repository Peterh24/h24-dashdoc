import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewOrderPage } from './new-order.page';

const routes: Routes = [
  {
    path: '',
    component: NewOrderPage
  },
  {
    path: 'deliveries',
    loadChildren: () => import('./deliveries/deliveries.module').then( m => m.DeliveriesPageModule)
  },
  {
    path: 'delivery',
    loadChildren: () => import('./delivery/delivery.module').then( m => m.DeliveryPageModule)
  },
  {
    path: 'vehicle-choice',
    loadChildren: () => import('./vehicle-choice/vehicle-choice.module').then( m => m.VehicleChoicePageModule)
  },
  {
    path: 'multipoint-choice',
    loadChildren: () => import('./multipoint-choice/multipoint-choice.module').then( m => m.MultipointChoicePageModule)
  },
  {
    path: 'summary',
    loadChildren: () => import('./summary/summary.module').then( m => m.SummaryPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewOrderPageRoutingModule {}
