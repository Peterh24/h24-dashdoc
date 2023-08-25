import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryPageRoutingModule } from './delivery-routing.module';

import { DeliveryPage } from './delivery.page';
import { HeaderModule, ProgressBarModule } from 'src/app/components';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    DeliveryPageRoutingModule,
    HeaderModule,
    ProgressBarModule
  ],
  declarations: [DeliveryPage]
})
export class DeliveryPageModule {}
