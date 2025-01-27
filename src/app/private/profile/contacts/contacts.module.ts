import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactsPageRoutingModule } from './contacts-routing.module';

import { ContactsPage } from './contacts.page';
import { HeaderModule } from 'src/app/components';
import { ProfileComponentModule } from '../profile.component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactsPageRoutingModule,
    HeaderModule,
    ProfileComponentModule
  ],
  declarations: [ContactsPage]
})
export class ContactsPageModule {}
