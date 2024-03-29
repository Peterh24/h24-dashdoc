import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AddressService } from 'src/app/services/address.service';
import { Address } from './address.model';
import { AlertController, IonItemSliding, LoadingController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { DASHDOC_API_URL, USER_STORAGE_KEY } from 'src/app/services/constants';

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
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private storage: Storage,
  ) { }

  ngOnInit() {
    // this.addressSub = this.addressService.address.subscribe(address => {
    //   this.address = address;
    //   this.jsonData = address;
    // })
  }

  ionViewWillEnter() {
    this.addressService.resetAddresses();
    this.address = [];
    this.jsonData = [];
    this.storage.get(USER_STORAGE_KEY).then(token => {

    })

    this.isLoading = true;
    this.addressService.fetchAddress().subscribe((address) => {
      this.address = address;
      this.jsonData = address;
      this.isLoading = false;
    });
  }

  getCountry(countryCode: string): string {
    return countryCode
  }

  setFilteredItems(searchTerm: string) {
    if (searchTerm.trim() === '') {
      this.jsonData = this.address
    } else {
      this.jsonData = this.address.filter((item) => {
        return item.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
  }

  onEdit(adressId: number, slidingItem: IonItemSliding){
    slidingItem.close();
    this.router.navigate(['/private/tabs/profile/address/edit-address', adressId]);
  }

  onRemoveAddress(addressPk: number, slidingElement: IonItemSliding, isOrigin:boolean): void {
    if (!isOrigin) {
      this.loadingController.create({
        message: '<div class="h24loader"></div>',
        mode: "ios"
      }).then(loadingElement => {
        loadingElement.present();
        this.addressService.removeAddress(addressPk).subscribe((addresses) => {
          this.isLoading = true;
          loadingElement.dismiss();
          this.isLoading = false;
          this.jsonData = addresses;
          slidingElement.close();
        });
      });
    } else {
      this.alertController.create({
        header: 'Suppression de l\'adresse',
        message: 'Vous ne pouvez pas supprimer l\'adresse d\'origine de la société',
        buttons: ['OK']
      }).then(alertElement => {
        alertElement.present()
      })
    }
  }
}
