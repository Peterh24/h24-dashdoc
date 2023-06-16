import { Injectable } from '@angular/core';
import { Address } from '../private/profile/address/address.model';
import { BehaviorSubject, map, tap } from 'rxjs';
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

  fetchAddress(){
    return this.http.get(`${DASHDOC_API_URL}addresses/`).pipe(map((resData:Request) => {
      const address = resData.results;
      return address;
    }),
    tap(address => {
      this._address.next(address);
    })
    );
  }
}
