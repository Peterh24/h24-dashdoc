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

  currentFolder: string;
  folders: string[] = [];
  addressFolder: any;
  selectedAddress: any = {};

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
    this.selectedAddress = {};
    this.currentFolder = 'root';

    this.addressService.fetchAddress().subscribe((address) => {
      this.isLoading = false;
      this.loadAddress (address);
    });
  }

  loadAddress (address: any) {
    this.address = address;
    this.jsonData = address;
    this.folders = ["Mes loueurs", "Mes studios",  "Mes favorites"];
    this.folders.sort ((a,b) => a.localeCompare (b));

    this.addressFolder = {};
    
    // TODO pour tester
    this.address.forEach ((a: any, index, arr: any[]) => {
      if (index > 5) {
        a.folder = this.folders[index % 2];
      } else {
        a.folder = 'root';
      }

      if (!this.addressFolder[a.folder]) {
        this.addressFolder[a.folder] = [];
      }

      this.addressFolder[a.folder].push (a);
    });

    this.selectFolder ('root');

    console.log (this.address, this.addressFolder);
  }

  getCountry(countryCode: string): string {
    return countryCode
  }

  setFilteredItems(searchTerm: string) {
    if (searchTerm.trim() === '') {
      this.selectFolder (this.currentFolder);
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
          if (slidingElement) {
            slidingElement.close();
          }
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

  toggleSelectedAddress (address: any, event: any) {
    event.preventDefault ();
    event.stopPropagation ();
    if (this.selectedAddress[address.pk]) {
      delete this.selectedAddress[address.pk];
    } else {
      this.selectedAddress[address.pk] = address;
    }
  }

  haveSelectedAddress () {
    return Object.keys (this.selectedAddress).length > 0;
  }

  createFolder (modal: any, name: any) {
    this.folders.push (name);
    this.folders.sort ((a,b) => a.localeCompare (b));
    modal.dismiss ();
  }

  showMoveToFolderModal () {
    document.getElementById ("move-to-folder")?.click ();
  }

  selectFolder (folder: string) {
    if (this.currentFolder === folder) {
      this.currentFolder = 'root';
    } else {
      this.currentFolder = folder;
    }

    this.jsonData = this.address.filter ((address: any) => address.folder === this.currentFolder);
    this.jsonData.sort ((a: any, b: any) => a.name.localeCompare (b.name));

    if (this.searchbarElem?.nativeElement) {
      this.searchbarElem.nativeElement.value = '';
    }
  }

  addressFolderItems (folder: string) {
    if (this.addressFolder[folder]) {
      return this.addressFolder[folder].length;
    } else {
      return 0;
    }
  }

  moveToFolder (modal: any, folder: string) {
    Object.values(this.selectedAddress).forEach ((address: any) => {
      if (!this.addressFolder[folder]) {
        this.addressFolder[folder] = [];
      }

      const addressFolder = address.folder || 'root';
      if (this.addressFolder[addressFolder]) {
        this.addressFolder[addressFolder] = this.addressFolder[addressFolder].filter ((a: any) => address.pk != a.pk);
      }

      address.folder = folder;
      this.addressFolder[folder].push (address);
    });

    this.selectedAddress = {};

    modal.dismiss ();

    this.selectFolder (this.currentFolder);

    console.log (9, this.addressFolder);
  }

  formatPhone (phone: string) {
    return phone.replace (/^\+33/, '0').replace (/\s+/, '').replace (/(\d\d)/g, "$1 ");
  }
}
