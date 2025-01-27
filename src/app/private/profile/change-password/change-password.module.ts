import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangePasswordPageRoutingModule } from './change-password-routing.module';

import { ChangePasswordPage } from './change-password.page';
import { HeaderModule } from 'src/app/components';
import { ProfileComponentModule } from '../profile.component.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ChangePasswordPageRoutingModule,
    HeaderModule,
    ProfileComponentModule
  ],
  declarations: [ChangePasswordPage]
})
export class ChangePasswordPageModule {}
