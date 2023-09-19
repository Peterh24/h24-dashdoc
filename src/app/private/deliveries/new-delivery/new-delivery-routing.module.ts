import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'vehicle-choice',
    pathMatch: 'full'
  },
  {
    path: 'vehicle-choice',
    loadChildren: () => import('./vehicle-choice/vehicle-choice.module').then( m => m.VehicleChoicePageModule)
  },
  {
    path: 'pick-up',
    loadChildren: () => import('./pick-up/pick-up.module').then( m => m.PickUpPageModule)
  },
  {
    path: 'merchandise',
    loadChildren: () => import('./merchandise/merchandise.module').then( m => m.MerchandisePageModule)
  },
  {
    path: 'delivery',
    loadChildren: () => import('../../deliveries/new-delivery/delivery/delivery.module').then( m => m.DeliveryPageModule),
    data: {edit:false}
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
export class NewDeliveryPageRoutingModule {}
