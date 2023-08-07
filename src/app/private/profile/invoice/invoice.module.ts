import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvoicePageRoutingModule } from './invoice-routing.module';

import { InvoicePage } from './invoice.page';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { SharedModule } from 'src/app/shared/shared.module';
import { HeaderModule } from 'src/app/components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvoicePageRoutingModule,
    SharedModule,
    HeaderModule
  ],
  declarations: [InvoicePage],
  providers: [
    FileOpener
  ]
})
export class InvoicePageModule {}
