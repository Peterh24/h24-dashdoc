import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { VehicleChoiceComponent } from './vehicle-choice.component';


@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule,],
  declarations: [VehicleChoiceComponent ],
  exports: [VehicleChoiceComponent ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VehicleChoiceComponentModule {}
