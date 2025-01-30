import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewOrderPageRoutingModule } from './new-order-routing.module';

import { NewOrderPage } from './new-order.page';
import { HeaderModule } from 'src/app/components';
import { TypeChoiceComponentModule } from './type-choice/type-choice.component.module';
import { VehicleChoiceComponentModule } from './vehicle-choice/vehicle-choice.component.module';
import { MultipointChoiceComponentModule } from './multipoint-choice/multipoint-choice.component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewOrderPageRoutingModule,
    HeaderModule,
    TypeChoiceComponentModule,
    VehicleChoiceComponentModule,
    MultipointChoiceComponentModule
  ],
  declarations: [NewOrderPage]
})
export class NewOrderPageModule {}
