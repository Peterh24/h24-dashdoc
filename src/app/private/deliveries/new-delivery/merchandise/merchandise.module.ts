import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MerchandisePageRoutingModule } from './merchandise-routing.module';

import { MerchandisePage } from './merchandise.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MerchandisePageRoutingModule
  ],
  declarations: [MerchandisePage]
})
export class MerchandisePageModule {}
