import { Injectable } from '@angular/core';
import { Address } from '../private/profile/address/address.model';
import { map, take, tap } from 'rxjs';
import { ApiTransportService } from './api-transport.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  addresses: Address[] = [];

  constructor(
    private apiTransport: ApiTransportService
  ) { }

  fetchAddress() {
    return this.apiTransport.getAddresses ().pipe (
      tap((addresses: Address[]) => {
        this.addresses = addresses
      })
    );
  }

  getAddress(id: any) {
    return this.addresses.find(a => a.id == id);
  }

  addAdress(name: string, address:string, city:string, postcode:string, country: string, instructions:string) {
      const newAddress = {
        name,
        address,
        city,
        postcode,
        country,
        instructions,
        is_origin: true,
        is_destination: true
    };

    return this.apiTransport.createAddress(newAddress).pipe(
      take(1),
      tap ((address: Address) => {
        this.addresses.push (address);
      })
    );
  }

  updateAddress(addressId: any, name: string,  address: string, postcode: string, city:string, country: string, instructions: string) {
    const updatedAddress = {
      name,
      address,
      city,
      postcode,
      country,
      instructions,
    };

    return this.apiTransport.updateAddress (addressId, updatedAddress).pipe (
      take(1),
      tap ((address: Address) => {
        if (address) {
          const index = this.addresses.findIndex ((address) => address.id == addressId);
          this.addresses[index] = address;
        }
      })
    )
  }

  removeAddress(addressId: number) {
    return this.apiTransport.deleteAddress(addressId).pipe(
      map((res) => {
        this.addresses = this.addresses.filter ((address) => address.id != addressId);
        return this.addresses;
      })
    );
  }

  resetAddresses() {
    this.addresses = [];
  }

}
