import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditAddressPageRoutingModule } from './edit-address-routing.module';

import { EditAddressPage } from './edit-address.page';
import { HeaderModule } from 'src/app/components';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    EditAddressPageRoutingModule,
    HeaderModule
  ],
  declarations: [EditAddressPage]
})
export class EditAddressPageModule {}
