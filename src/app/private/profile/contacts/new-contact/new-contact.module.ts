import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewContactPageRoutingModule } from './new-contact-routing.module';

import { NewContactPage } from './new-contact.page';
import { HeaderModule } from 'src/app/components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NewContactPageRoutingModule,
    HeaderModule,
  ],
  declarations: [NewContactPage]
})
export class NewContactPageModule {}
