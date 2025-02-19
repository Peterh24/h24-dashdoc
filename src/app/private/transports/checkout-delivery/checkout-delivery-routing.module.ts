import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CheckoutDeliveryComponent } from './checkout-delivery.component';


const routes: Routes = [
  {
    path: '',
    component: CheckoutDeliveryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckoutDeliveryComponentRoutingModule {}
