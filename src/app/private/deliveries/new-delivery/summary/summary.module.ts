import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SummaryPageRoutingModule } from './summary-routing.module';

import { SummaryPage } from './summary.page';
import { HeaderModule, ProgressBarModule } from 'src/app/components';
import { AddReferenceComponent } from './add-reference/add-reference.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SummaryPageRoutingModule,
    HeaderModule,
    ProgressBarModule
  ],
  declarations: [SummaryPage, AddReferenceComponent]
})
export class SummaryPageModule {}
