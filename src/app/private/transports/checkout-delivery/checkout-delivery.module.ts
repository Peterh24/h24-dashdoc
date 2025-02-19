import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HeaderModule } from 'src/app/components';
import { CheckoutDeliveryComponent } from './checkout-delivery.component';
import { CheckoutDeliveryComponentRoutingModule } from './checkout-delivery-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CheckoutDeliveryComponentRoutingModule,
    HeaderModule
  ],
  declarations: [
    CheckoutDeliveryComponent
  ]
})
export class CheckoutDeliveryComponentModule {}
