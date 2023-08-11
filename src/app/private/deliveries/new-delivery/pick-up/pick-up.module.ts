import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickUpPageRoutingModule } from './pick-up-routing.module';

import { PickUpPage } from './pick-up.page';
import { HeaderModule, ProgressBarModule } from 'src/app/components';
import { HourComponent } from './hour/hour.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    PickUpPageRoutingModule,
    HeaderModule,
    ProgressBarModule
  ],
  declarations: [PickUpPage, HourComponent]
})
export class PickUpPageModule {}
