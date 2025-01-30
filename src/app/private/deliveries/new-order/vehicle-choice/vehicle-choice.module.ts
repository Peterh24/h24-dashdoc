import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VehicleChoicePageRoutingModule } from './vehicle-choice-routing.module';

import { VehicleChoicePage } from './vehicle-choice.page';
import { HeaderModule, ProgressBarModule } from 'src/app/components';
import { VehicleChoiceComponentModule } from './vehicle-choice.component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VehicleChoicePageRoutingModule,
    HeaderModule,
    ProgressBarModule,
    VehicleChoiceComponentModule
  ],
  declarations: [VehicleChoicePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VehicleChoicePageModule {}
