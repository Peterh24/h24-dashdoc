import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditDeliveryPageRoutingModule } from './edit-delivery-routing.module';

import { EditDeliveryPage } from './edit-delivery.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditDeliveryPageRoutingModule
  ],
  declarations: [EditDeliveryPage]
})
export class EditDeliveryPageModule {}
