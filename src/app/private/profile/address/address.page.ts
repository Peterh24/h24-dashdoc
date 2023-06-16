import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AddressService } from 'src/app/services/address.service';
import { Address } from './address.model';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
})
export class AddressPage implements OnInit {
  private addressSub: Subscription;
  address: Array<Address> = [];
  isLoading: boolean = false;
  constructor(
    private addressService: AddressService,
  ) { }

  ngOnInit() {
    this.addressSub = this.addressService.address.subscribe(address => {
      this.address = address;
    })
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.addressService.fetchAddress().subscribe(() => {
      this.isLoading = false;
    });
  }

  getCountry(countryCode: string): string {
    return countryCode
  }

}
