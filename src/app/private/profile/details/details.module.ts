import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailsPageRoutingModule } from './details-routing.module';

import { DetailsPage } from './details.page';
import { HeaderModule } from 'src/app/components';
import { ProfileComponentModule } from '../profile.component.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    DetailsPageRoutingModule,
    HeaderModule,
    ProfileComponentModule
  ],
  declarations: [DetailsPage]
})
export class DetailsPageModule {}
