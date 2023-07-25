import { NgModule } from '@angular/core';
import { priceFormatPipe } from 'src/app/utils/pipes/price-format.pipe';


@NgModule({
  declarations: [priceFormatPipe],
  exports: [priceFormatPipe]
})
export class SharedModule { }
