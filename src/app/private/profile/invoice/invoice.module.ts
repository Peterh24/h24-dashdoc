import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvoicePageRoutingModule } from './invoice-routing.module';

import { InvoicePage } from './invoice.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { HeaderModule } from 'src/app/components';
import { ProfileComponentModule } from '../profile.component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvoicePageRoutingModule,
    SharedModule,
    HeaderModule,
    ProfileComponentModule
  ],
  declarations: [InvoicePage]
})
export class InvoicePageModule {}
