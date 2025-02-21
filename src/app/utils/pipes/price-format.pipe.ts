import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'priceFormat',
    standalone: false
})
export class priceFormatPipe implements PipeTransform {
  transform(value: any): string {
    if (typeof value !== 'number' && typeof value !== 'string') {
      return ''; // ou une valeur par défaut appropriée
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    const formattedValue = numericValue.toFixed(2);
    const parts = formattedValue.split('.');
    const decimalPart = parts[1];

    if (decimalPart === '00') {
      return parts[0];
    }

    return formattedValue;
  }
}
