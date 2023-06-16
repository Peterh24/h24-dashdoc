import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  searchAddress: string;
  jsonData: any;
  startIndex: number = 0;
  @ViewChild("searchbarElem", { read: ElementRef }) private searchbarElem: ElementRef;
  constructor(
    private addressService: AddressService,
  ) { }

  ngOnInit() {
    this.addressSub = this.addressService.address.subscribe(address => {
      this.address = address;
      this.jsonData = address;
    })
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.addressService.fetchAddress().subscribe((address) => {
      this.address = address;
      this.jsonData = this.address.slice(0, 10);
      this.isLoading = false;
    });
  }

  getCountry(countryCode: string): string {
    return countryCode
  }

  setFilteredItems(searchTerm: string) {
    if (searchTerm.trim() === '') {
      this.jsonData = this.address.slice(0, 10);
    } else {
      this.jsonData = this.address.filter((item) => {
        return item.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
  }

  loadMoreData(event: any) {
    const nextAddresses = this.address.slice(this.startIndex, this.startIndex + 10);
    console.log('nextAddresses: ', nextAddresses)
    if (nextAddresses.length > 0) {
      this.jsonData = this.jsonData.concat(nextAddresses);
      this.startIndex += 10;
    } else {
      event.target.disabled = true; // Désactiver le chargement supplémentaire s'il n'y a plus d'adresses
    }
    event.target.complete(); // Indiquer que le chargement est terminé
  }

}
