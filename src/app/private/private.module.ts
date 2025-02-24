import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrivatePageRoutingModule } from './private-routing.module';

import { PrivatePage } from './private.page';
import { ProfilePageModule } from './profile/profile.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrivatePageRoutingModule,
  ],
  declarations: [PrivatePage]
})
export class PrivatePageModule {}
