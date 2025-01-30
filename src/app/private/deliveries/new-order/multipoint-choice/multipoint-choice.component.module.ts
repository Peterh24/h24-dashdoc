import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MultipointChoiceComponent } from './multipoint-choice.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule,],
  declarations: [MultipointChoiceComponent],
  exports: [MultipointChoiceComponent]
})
export class MultipointChoiceComponentModule {}
