import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailDeliveryPageRoutingModule } from './detail-delivery-routing.module';

import { DetailDeliveryPage } from './detail-delivery.page';
import { ModalImgComponent } from './modal-img/modal-img.component';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { HeaderModule } from 'src/app/components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailDeliveryPageRoutingModule,
    HeaderModule
  ],
  declarations: [
    DetailDeliveryPage,
    ModalImgComponent
  ],
  providers: [
    FileOpener
  ]
})
export class DetailDeliveryPageModule {}
