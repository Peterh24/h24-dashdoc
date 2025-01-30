import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultipointChoicePageRoutingModule } from './multipoint-choice-routing.module';

import { MultipointChoicePage } from './multipoint-choice.page';
import { HeaderModule } from 'src/app/components';
import { MultipointChoiceComponentModule } from './multipoint-choice.component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MultipointChoicePageRoutingModule,
    HeaderModule,
    MultipointChoiceComponentModule
  ],
  declarations: [MultipointChoicePage]
})
export class MultipointChoicePageModule {}
