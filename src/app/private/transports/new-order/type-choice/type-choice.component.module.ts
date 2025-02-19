import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TypeChoiceComponent } from './type-choice.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule,],
  declarations: [TypeChoiceComponent ],
  exports: [TypeChoiceComponent ]
})
export class TypeChoiceComponentModule {}
