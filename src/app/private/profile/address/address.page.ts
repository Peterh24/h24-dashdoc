import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AddressService } from 'src/app/services/address.service';
import { Address } from './address.model';
import { AlertController, IonItemSliding, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ADDRESS_FOLDER_KEY, DASHDOC_API_URL, DASHDOC_COMPANY, USER_STORAGE_KEY } from 'src/app/services/constants';
import { NewAddressPage } from './new-address/new-address.page';
import { EditAddressPage } from './edit-address/edit-address.page';

const DEFAULT_FOLDERS = [
  "Mes loueurs",
  "Mes studios",
  "Mes favorites"
];

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
})
export class AddressPage implements OnInit {
  @Input() isModal: boolean;

  private addressSub: Subscription;
  address: Array<Address> = [];
  isLoading: boolean = false;
  searchAddress: string;
  jsonData: any;
  startIndex: number = 0;

  currentFolder: string;
  folders: any[] = [];
  addressFolder: any;
  selectedAddress: any = {};

  @ViewChild("searchbarElem", { read: ElementRef }) private searchbarElem: ElementRef;
  constructor(
    private addressService: AddressService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController,
    private storage: Storage,
  ) { }

  ngOnInit() {
    // this.addressSub = this.addressService.address.subscribe(address => {
    //   this.address = address;
    //   this.jsonData = address;
    // })
  }

  ionViewWillEnter() {
    this.address = [];
    this.jsonData = [];
    this.addressFolder = {};
    this.storage.get(USER_STORAGE_KEY).then(token => {

    })

    this.isLoading = true;
    this.selectedAddress = {};
    this.currentFolder = null;

    // TODO: verifier si les adresses sont déjà chargées
    this.addressService.fetchAddress().subscribe({
      next: (address) => {
        this.isLoading = false;

        this.storage.get(DASHDOC_COMPANY).then ((pk) => {
          this.storage.get (`${ADDRESS_FOLDER_KEY}_${pk}`).then ((addressFolder) => {
            if (addressFolder == null) {
              this.folders = DEFAULT_FOLDERS;
            } else {
              // on efface le dossier des adresses supprimées
              Object.keys (addressFolder).forEach ((pk) => {
                if (!address.find ((a) => a.pk == parseInt(pk))) {
                  delete addressFolder[pk];
                }
              });
              this.addressFolder = addressFolder;
              this.folders = [...new Set (Object.values(addressFolder))];
            }

            this.loadAddress (address);
          })
        });
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  loadAddress (address: any[]) {
    this.address = address;
    this.jsonData = address;

    DEFAULT_FOLDERS.forEach ((folder) => {
      if (!this.folders.find ((f) => f == folder)) {
        this.folders.push (folder);
      }
    })
    this.folders.sort ((a,b) => a.localeCompare (b));

    this.selectFolder (null);
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

  async onAddAddress (addressPk: number = null, slidingItem: IonItemSliding = null) {
    const modal = await this.modalController.create({
      component: addressPk ? EditAddressPage : NewAddressPage,
      componentProps: {
        isModal: true,
        addressPk: addressPk
      },
      cssClass: 'address-modal',
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      if (addressPk) {
        const addressIndex = this.address.findIndex ((a) => a.pk == addressPk);
        this.address[addressIndex] = data;
      } else {
        this.address.push (data);
      }

      this.selectFolder (null);

      const toast = await this.toastController.create({
        message: 'L\'adresses a bien été ajoutée',
        duration: 3000,
        position: 'bottom',
        icon: 'checkbox-outline',
        cssClass: 'toast-success'
      });
  
      await toast.present();  
    }
  }

  onRemoveAddress(addressPk: number, slidingElement: IonItemSliding = null, isOrigin:boolean = false): void {
    if (!isOrigin) {
      this.alertController.create({
        header: 'Suppression de l\'adresse',
        message: 'Voulez vous supprimer l\'adresse de la société',
        buttons: ['OK']
      }).then(alertElement => {
        this.loadingController.create({
          message: '<div class="h24loader"></div>',
          mode: "ios"
        }).then(loadingElement => {
          loadingElement.present();
          this.addressService.removeAddress(addressPk).subscribe(async (addresses) => {
            this.isLoading = true;
            loadingElement.dismiss();
            this.isLoading = false;
            this.jsonData = addresses;
            this.address = addresses;
            if (slidingElement) {
              slidingElement.close();
            }
            this.selectFolder (null);

            const toast = await this.toastController.create({
              message: 'L\'adresses a bien été supprimée',
              duration: 3000,
              position: 'bottom',
              icon: 'checkbox-outline',
              cssClass: 'toast-success'
            });
        
            await toast.present();        
          });
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
      this.currentFolder = null;
    } else {
      this.currentFolder = folder;
    }

    this.jsonData = this.address.filter ((address: any) => this.addressFolder[address.pk] == this.currentFolder);
    this.jsonData.sort ((a: any, b: any) => a.name.localeCompare (b.name));

    if (this.searchbarElem?.nativeElement) {
      this.searchbarElem.nativeElement.value = '';
    }
  }

  addressFolderItems (folder: string) {
    return Object.values (this.addressFolder).filter ((f: any) => folder == f).length;
  }

  async moveToFolder (modal: any, folder: string) {
    Object.values(this.selectedAddress).forEach ((address: any) => {
      if (folder == null) {
        delete this.addressFolder[address.pk];
      } else {
        this.addressFolder[address.pk] = folder;
      }

      this.storage.get(DASHDOC_COMPANY).then ((pk) => {
        this.storage.set (`${ADDRESS_FOLDER_KEY}_${pk}`, this.addressFolder);
      });
    });

    this.selectedAddress = {};

    modal.dismiss ();

    this.selectFolder (this.currentFolder);

    const toast = await this.toastController.create({
      message: 'Les adresses ont bien été déplacée dans le dossier ' + folder,
      duration: 1500,
      position: 'bottom',
      icon: 'checkbox-outline',
      cssClass: 'toast-success'
    });

    await toast.present();
  }

  formatPhone (phone: string) {
    return phone.replace (/^\+33/, '0').replace (/\s+/, '').replace (/(\d\d)/g, "$1 ");
  }

  selectAddress (address: any, event: any) {
    if (this.isModal) {
      event.preventDefault ();
      event.stopPropagation ();
      event.stopImmediatePropagation ();
      this.modalController.dismiss (address);
    }
  }

  closeModal () {
    if (this.isModal) {
        this.modalController.dismiss ();
    }
  }
}
