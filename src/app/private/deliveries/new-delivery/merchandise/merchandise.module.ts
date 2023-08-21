import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MerchandisePageRoutingModule } from './merchandise-routing.module';

import { MerchandisePage } from './merchandise.page';
import { HeaderModule, ProgressBarModule } from 'src/app/components';
import { ModalQuantityComponent } from './modal-quantity/modal-quantity.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    MerchandisePageRoutingModule,
    HeaderModule,
    ProgressBarModule
  ],
  declarations: [MerchandisePage, ModalQuantityComponent]
})
export class MerchandisePageModule {}
