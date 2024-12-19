import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewOrderPageRoutingModule } from './new-order-routing.module';

import { NewOrderPage } from './new-order.page';
import { HeaderModule } from 'src/app/components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewOrderPageRoutingModule,
    HeaderModule
  ],
  declarations: [NewOrderPage]
})
export class NewOrderPageModule {}
