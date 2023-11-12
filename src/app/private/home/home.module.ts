import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { ModalAddTokenComponent } from './modal-add-token/modal-add-token.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HeaderModule } from 'src/app/components';
import { ModalAddCompanyComponent } from './modal-add-company/modal-add-company.component';

@NgModule({

  declarations: [HomePage, ModalAddTokenComponent, ModalAddCompanyComponent],
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
