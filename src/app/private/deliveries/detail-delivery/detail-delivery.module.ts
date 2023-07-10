import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailDeliveryPageRoutingModule } from './detail-delivery-routing.module';

import { DetailDeliveryPage } from './detail-delivery.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailDeliveryPageRoutingModule
  ],
  declarations: [DetailDeliveryPage]
})
export class DetailDeliveryPageModule {}
