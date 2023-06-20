import { Injectable } from '@angular/core';
import { Address } from '../private/profile/address/address.model';
import { BehaviorSubject, EMPTY, expand, from, map, reduce, switchMap, take, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { DASHDOC_API_URL } from './constants';
import { Request } from '../private/models/request.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private _address = new BehaviorSubject<Array<Address>>([]);
  private company: number;
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
        this._address.next([...this._address.value, ...address]);
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
        const newAddress = new Address(
          Math.random(),
          name,
          address,
          city,
          postcode,
          country,
          instructions
        );

        return this.http.post(
          `${DASHDOC_API_URL}addresses`,
          {
            "name": "Société du futur",
            "address": "3 rue de passé",
            "city": "present",
            "postcode": "75000",
            "country": "FR",
            "company": {
              "pk": companyPk
            }
          }
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
        console.log('address toto:  ',address);
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
}
