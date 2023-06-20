import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Country } from '../../../app/private/models/country.model';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private _countries = new BehaviorSubject<Array<Country>>(
    [
      {key: 'DE', value:'Allemagne'},
      {key: 'BE', value:'Belgique'},
      {key: 'ES', value:'Espagne'},
      {key: 'FR', value:'France'},
      {key: 'IT', value:'Italie'}
    ]
  )

  get countries() {
    return this._countries.asObservable();
  }
  constructor() { }
}
