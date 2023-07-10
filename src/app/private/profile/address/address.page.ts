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
    this.storage.get(USER_STORAGE_KEY).then(token => {
      console.log('get token from address: ', token);
    })

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

  onEdit(adressId: number, slidingItem: IonItemSliding){
    slidingItem.close();
    this.router.navigate(['/private/tabs/profile/address/edit-address', adressId]);
  }

  onRemoveAddress(addressPk: number, slidingElement: IonItemSliding, isOrigin:boolean): void {
    slidingElement.close();
    if(!isOrigin) {
      this.loadingController.create({
        message: 'Suppression de l\'addresse...',
        mode:"ios"
      }).then(loadingElement => {
        loadingElement.present();
        this.addressService.removeAddress(addressPk).subscribe(() => {
          loadingElement.dismiss();
        });
      });
    } else {
      this.alertController.create({
        header: 'Suppression de l\'address',
        message: 'Vous ne pouvez pas supprimer l\'adresse d\'origine de la société',
        buttons: ['OK']
      }).then(loadingElement => {
        loadingElement.present()
      })
    }

  }

}
