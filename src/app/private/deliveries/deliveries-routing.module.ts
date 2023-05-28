import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveriesPage } from './deliveries.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveriesPage
  },
  {
    path: 'edit-delivery',
    loadChildren: () => import('./edit-delivery/edit-delivery.module').then( m => m.EditDeliveryPageModule)
  },
  {
    path: 'new-delivery',
    loadChildren: () => import('./new-delivery/new-delivery.module').then( m => m.NewDeliveryPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveriesPageRoutingModule {}
