import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveriesPageRoutingModule } from './transports-routing.module';

import { SharedModule } from 'src/app/shared/shared.module';
import { HeaderModule } from 'src/app/components';
import { TransportsPage } from './transports.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveriesPageRoutingModule,
    SharedModule,
    HeaderModule
  ],
  declarations: [TransportsPage],
})
export class DeliveriesPageModule {}
