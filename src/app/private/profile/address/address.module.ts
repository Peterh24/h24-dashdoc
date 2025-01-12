import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddressPageRoutingModule } from './address-routing.module';

import { AddressPage } from './address.page';
import { HeaderModule } from 'src/app/components';
import { NewAddressPageModule } from './new-address/new-address.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddressPageRoutingModule,
    HeaderModule,
    NewAddressPageModule
  ],
  declarations: [AddressPage]
})
export class AddressPageModule {}
