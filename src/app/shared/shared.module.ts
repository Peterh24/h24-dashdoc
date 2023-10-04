import { NgModule } from '@angular/core';
import { priceFormatPipe } from 'src/app/utils/pipes/price-format.pipe';
import { LoaderComponent } from '../components/loader/loader.component';


@NgModule({
  declarations: [
    priceFormatPipe,
    LoaderComponent
  ],
  exports: [
    priceFormatPipe,
    LoaderComponent
  ]
})
export class SharedModule { }
