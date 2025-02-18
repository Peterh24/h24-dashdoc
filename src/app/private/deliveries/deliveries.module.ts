import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveriesPageRoutingModule } from './deliveries-routing.module';

import { SharedModule } from 'src/app/shared/shared.module';
import { HeaderModule } from 'src/app/components';
import { DeliveriesPage } from './deliveries.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveriesPageRoutingModule,
    SharedModule,
    HeaderModule
  ],
  declarations: [DeliveriesPage],
})
export class DeliveriesPageModule {}
