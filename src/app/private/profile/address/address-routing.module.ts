import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddressPage } from './address.page';

const routes: Routes = [
  {
    path: '',
    component: AddressPage
  },
  {
    path: 'new-address',
    loadChildren: () => import('./new-address/new-address.module').then( m => m.NewAddressPageModule)
  },
  {
    path: 'edit-address/:adressId',
    loadChildren: () => import('./edit-address/edit-address.module').then( m => m.EditAddressPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddressPageRoutingModule {}
