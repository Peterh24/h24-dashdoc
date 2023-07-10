import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take } from 'rxjs';
import { Country } from '../../../app/private/models/country.model';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private countriesArray =
    [
      {key: 'DE', value:'Allemagne'},
      {key: 'BE', value:'Belgique'},
      {key: 'ES', value:'Espagne'},
      {key: 'FR', value:'France'},
      {key: 'IT', value:'Italie'}
    ]


  get countries() {
    return this.countriesArray;
  }

  getCountry(key: any) {
    return this.countries.find(c => c.key === key).value;
  }
  constructor() { }
}
