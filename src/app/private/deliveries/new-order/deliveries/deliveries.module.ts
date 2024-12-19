import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveriesPageRoutingModule } from './deliveries-routing.module';

import { DeliveriesPage } from './deliveries.page';
import { HeaderModule, ProgressBarModule } from 'src/app/components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveriesPageRoutingModule,
    ProgressBarModule,
    HeaderModule
  ],
  declarations: [DeliveriesPage]
})
export class DeliveriesPageModule {}
