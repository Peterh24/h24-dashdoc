import { Injectable } from '@angular/core';
import { Address } from '../private/profile/address/address.model';
import { BehaviorSubject, EMPTY, delay, expand, from, map, of, reduce, switchMap, take, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
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
    private storage: Storage,
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

  getAddress(id: any) {
    return this.address.pipe(
      take(1),
      map(address => {
        return address.find(a => a.pk === parseInt(id));
      })
    );
  }

  addAdress(name: string, address:string, city:string, postcode:string, country: string, instructions:string) {
    return from(this.storage.get('DASHDOC_COMPANY')).pipe(
      switchMap(companyPk => {
        const newAddress = {
          name,
          address,
          city,
          postcode,
          country,
          instructions
      };

        return this.http.post(
          `${DASHDOC_API_URL}addresses/`,
          newAddress
        ).pipe(
          take(1),
          switchMap((resData: any) => {
            const updatedAddresses = [...this._address.value, resData];
            this._address.next(updatedAddresses);
            return of(resData);
          })
        );
      }),
      take(1),
      tap(resData => {
        console.log('resData Address: ', resData);
      })
    );
  }

  updateAddress(addressId:any, name:string,  addressString: string, postalCode:string, city:string, country: string, instructions:string) {
    let updatedAddress: Array<Address>
    return this.address.pipe(
      take(1),
      switchMap((address) =>  {
        const updatedAddressIndex = address.findIndex(ad => ad.pk === addressId);
        updatedAddress = [...address];
        const oldAddress = updatedAddress[updatedAddressIndex];
        updatedAddress[updatedAddressIndex] = new Address(
          oldAddress.pk,
          name,
          addressString,
          postalCode,
          city,
          country,
          instructions
        );
        return this.http.patch(
          `${DASHDOC_API_URL}addresses/${addressId}`,
          {...updatedAddress[updatedAddressIndex]}
        );
      }),
      tap(() => {
        this._address.next(updatedAddress)
      })
    );
  }

  removeAddress(addressId: number) {
    return this.http.delete(`${DASHDOC_API_URL}addresses/${addressId}/`).pipe(
      switchMap(() => {
        return this.address.pipe(
          take(1),
          map(addresses => addresses.filter(a => a.pk !== addressId))
        );
      }),
      tap(filteredAddresses => {
        this._address.next(filteredAddresses);
      })
    );
  }

  resetAddresses() {
    this._address.next([]);
  }

}
