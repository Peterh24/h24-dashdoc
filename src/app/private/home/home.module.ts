import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { ModalAddTokenComponent } from './modal-add-token/modal-add-token.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HeaderModule } from 'src/app/components';

@NgModule({

  declarations: [HomePage, ModalAddTokenComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    SharedModule,
    HeaderModule
  ]
})
export class HomePageModule {}
