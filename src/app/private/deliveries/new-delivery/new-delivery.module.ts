import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewDeliveryPageRoutingModule } from './new-delivery-routing.module';

import { NewDeliveryPage } from './new-delivery.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewDeliveryPageRoutingModule
  ],
  declarations: [NewDeliveryPage]
})
export class NewDeliveryPageModule {}
