import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { IonicModule } from '@ionic/angular';
import { ProfileComponentModule } from 'src/app/private/profile/profile.component.module';



@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    IonicModule,
    CommonModule,
    ProfileComponentModule
  ],
  exports: [
    HeaderComponent
  ]
})
export class HeaderModule { }
