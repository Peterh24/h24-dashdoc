import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveriesPageRoutingModule } from './deliveries-routing.module';

import { DeliveriesPage } from './deliveries.page';
import { HeaderModule, ProgressBarModule } from 'src/app/components';
import { DeliveryPageModule } from '../delivery/delivery.module';
import { SummmaryComponentModule } from '../summary/summary.component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveriesPageRoutingModule,
    ProgressBarModule,
    HeaderModule,
    DeliveryPageModule,
    SummmaryComponentModule
  ],
  declarations: [DeliveriesPage]
})
export class DeliveriesPageModule {}
