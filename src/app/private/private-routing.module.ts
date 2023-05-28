import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrivatePage } from './private.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'deliveries',
    loadChildren: () => import('./deliveries/deliveries.module').then( m => m.DeliveriesPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivatePageRoutingModule {}
