import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationsPageRoutingModule } from './notifications-routing.module';

import { NotificationsPage } from './notifications.page';
import { HeaderModule } from 'src/app/components';
import { ProfileComponentModule } from '../profile.component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationsPageRoutingModule,
    HeaderModule,
    ProfileComponentModule
  ],
  declarations: [NotificationsPage]
})
export class NotificationsPageModule {}
