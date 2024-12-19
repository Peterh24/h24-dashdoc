import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SummaryPageRoutingModule } from './summary-routing.module';

import { SummaryPage } from './summary.page';
import { HeaderModule } from 'src/app/components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SummaryPageRoutingModule,
    HeaderModule
  ],
  declarations: [SummaryPage]
})
export class SummaryPageModule {}
