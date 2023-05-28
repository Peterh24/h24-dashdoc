import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VehicleChoicePageRoutingModule } from './vehicle-choice-routing.module';

import { VehicleChoicePage } from './vehicle-choice.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VehicleChoicePageRoutingModule
  ],
  declarations: [VehicleChoicePage]
})
export class VehicleChoicePageModule {}
