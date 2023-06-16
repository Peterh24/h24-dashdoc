import { Injectable } from '@angular/core';
import { Address } from '../private/profile/address/address.model';
import { BehaviorSubject, EMPTY, expand, map, reduce, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL } from './constants';
import { Request } from '../private/models/request.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private _address = new BehaviorSubject<Array<Address>>([]);

  get address() {
    return this._address.asObservable();
  }

  constructor(
    private http: HttpClient,
  ) { }

  fetchAddress() {
    return this.http.get(`${DASHDOC_API_URL}addresses/`).pipe(
      expand((resData: Request) => {
        if (resData.next !== null) {
          return this.http.get(resData.next);
        } else {
          return EMPTY;
        }
      }),
      map((resData: Request) => resData.results),
      reduce((address: Address[], results: Address[]) => address.concat(results), []),
      tap((address: Address[]) => {
        this._address.next(address);
      })
    );
  }
}
