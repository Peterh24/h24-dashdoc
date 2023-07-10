import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveriesPageRoutingModule } from './deliveries-routing.module';

import { DeliveriesPage } from './deliveries.page';
import { priceFormatPipe } from 'src/app/utils/pipes/price-format.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveriesPageRoutingModule
  ],
  declarations: [DeliveriesPage, priceFormatPipe]
})
export class DeliveriesPageModule {}
