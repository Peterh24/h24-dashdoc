import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AddressService } from 'src/app/services/address.service';
import { AlertController, IonItemSliding, IonSearchbar, ModalController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ADDRESS_FOLDER_KEY, ADDRESS_FOLDERS_KEY, CURRENT_COMPANY, HTTP_REQUEST_UNKNOWN_ERROR } from 'src/app/services/constants';
import { NewAddressPage } from './new-address/new-address.page';
import { EditAddressPage } from './edit-address/edit-address.page';
import { ConfigService } from 'src/app/services/config.service';
import { Address } from '../../models/transport.model';
import { IonModal } from '@ionic/angular/common';

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
  addresses: Address[] = [];
  isLoading: boolean = false;
  searchAddress: string;
  displayedAddresses: Address[];
  startIndex: number = 0;
  subscription: Subscription;

  currentFolder: Address[];
  currentFolderName: string;
  folders: string[] = [];
  addressFolder: Record<string, string>;
  selectedAddress: Record<string, Address> = {};
  renameFolderName: string;

  deleteAddress: Address;

  @ViewChild(IonSearchbar) public searchbarElem: IonSearchbar;

  constructor(
    private addressService: AddressService,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController,
    private storage: Storage,
    public config: ConfigService
  ) { }

  ngOnInit() {
    // this.addressSub = this.addressService.address.subscribe(address => {
    //   this.address = address;
    //   this.jsonData = address;
    // })
  }

  ionViewWillEnter() {
    this.addresses = [];
    this.displayedAddresses = [];
    this.addressFolder = {};

    this.isLoading = true;
    this.selectedAddress = {};
    this.currentFolderName = null;

    // TODO: verifier si les adresses sont déjà chargées
    this.subscription = this.addressService.fetchAddress().subscribe({
      next: (addresses: Address[]) => {
        this.isLoading = false;

        this.storage.get(CURRENT_COMPANY).then ((id) => {
          this.storage.get (`${ADDRESS_FOLDER_KEY}_${id}`).then ((addressFolder) => {
            if (!addressFolder) {
              addressFolder = {};
            }

            // on efface le dossier des adresses supprimées
            Object.keys (addressFolder).forEach ((id) => {
              if (!addresses.find ((a: Address) => a.id == id)) {
                delete addressFolder[id];
              }
            });
            this.addressFolder = addressFolder;

            this.storage.get (`${ADDRESS_FOLDERS_KEY}_${id}`).then ((folders) => {
              if (!folders) {
                folders = DEFAULT_FOLDERS;
              }
              folders.sort ((a: string, b: string) => a.localeCompare (b));
              this.folders = folders;
            });

            this.loadAddress ([...addresses]);
          })
        });
      },
      error: (error) => {
        this.isLoading = false;
      }
    });

    this.subscription.add(() => {
      this.subscription = null;
      this.isLoading = false;
    });

  }

  ionViewWillLeave () {
    if (this.subscription) {
      this.subscription.unsubscribe ();
      this.subscription = null;
    }
  }

  loadAddress (address: Address[]) {
    this.addresses = address;
    this.displayedAddresses = address;

    this.selectFolder (null);
  }

  getCountry(countryCode: string): string {
    return countryCode
  }

  setFilteredItems(searchTerm: string) {
    if (searchTerm.trim() === '') {
      this.selectFolder (this.currentFolderName);
    } else {
      const term = searchTerm.toLocaleLowerCase ();

      this.displayedAddresses = this.addresses.filter((address: any) => {
        return ['name', 'address', 'postcode', 'city']
          .filter ((field) => address[field].toLowerCase ().includes(term)).length;
      });
    }
  }

  async onAddAddress (addressId: number = null, folder: string = null, slidingItem: IonItemSliding = null) {
    const modal = await this.modalController.create({
      component: addressId ? EditAddressPage : NewAddressPage,
      componentProps: {
        isModal: true,
        addressId: addressId
      },
      cssClass: 'custom-big',
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      if (addressId) {
        const addressIndex = this.addresses.findIndex ((a: Address) => parseInt(a.id) == addressId);
        this.addresses[addressIndex] = data;
      } else {
        this.addresses.push (data);
      }

      if (folder) {
        this.addressFolder[data.id] = folder;
        this.selectedAddress = {};
        this.selectedAddress[data.id] = data;
        this.moveToFolder (folder, null, false);
      }

      this.openFolder (this.currentFolderName);

      this.selectFolder (null);

      const toast = await this.toastController.create({
        message: 'L\'adresses a bien été ajoutée à votre liste d\'adresses',
        duration: 5000,
        position: 'bottom',
        icon: 'checkbox-outline',
        cssClass: 'success'
      });

      await toast.present();
    }
  }

  setDeleteAddress (address: Address, slidingItem: IonItemSliding = null) {
    this.deleteAddress = address;

    if (slidingItem) {
      slidingItem.close();
    }
  }

  onRemoveAddress(addressId: string, slidingItem: IonItemSliding = null, isOrigin:boolean = false): void {
    this.setDeleteAddress (null);

    if (slidingItem) {
      slidingItem.close();
    }

    this.addressService.removeAddress(addressId).subscribe({
      next: async (addresses: Address[]) => {
        delete this.addressFolder[addressId];
        this.openFolder (this.currentFolderName);

        this.addresses = this.addresses.filter ((address) => address.id != addressId);
        this.displayedAddresses = this.addresses;
        this.selectFolder (null);

        const toast = await this.toastController.create({
          message: 'L\'adresses a bien été supprimée',
          duration: 5000,
          position: 'bottom',
          icon: 'checkbox-outline',
          cssClass: 'success'
        });

        await toast.present();
      },
      error: async (error) => {
        console.log (error);

        const alert = await this.alertController.create({
          header: "Erreur",
          message: HTTP_REQUEST_UNKNOWN_ERROR,
          buttons: ['Compris'],
        });

        await alert.present();
      }
    });
  }

  toggleSelectedAddress (address: Address, event: any) {
    event.preventDefault ();
    event.stopPropagation ();
    if (this.selectedAddress[address.id]) {
      delete this.selectedAddress[address.id];
    } else {
      this.selectedAddress[address.id] = address;
    }
  }

  haveSelectedAddress () {
    return Object.keys (this.selectedAddress).length > 0;
  }

  createFolder (name: string | number, modal: IonModal) {
    if (name) {
      this.folders.push (String(name));
      this.folders.sort ((a,b) => a.localeCompare (b));

      this.storage.get(CURRENT_COMPANY).then ((id) => {
        this.storage.set (`${ADDRESS_FOLDERS_KEY}_${id}`, this.folders);
      });
    }
    modal.dismiss ();
  }

  async deleteFolder (folder: string, event: any) {
    event.preventDefault ();
    event.stopPropagation ();
    event.stopImmediatePropagation ();

    const alert = await this.alertController.create({
      header: `Suppression du dossier`,
      message: `Voulez vous supprimer le dossier ${folder}`,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.storage.get(CURRENT_COMPANY).then ((id) => {
              for (var address in this.addressFolder) {
                if (this.addressFolder[address] == folder) {
                  delete this.addressFolder[address];
                }
              }

              this.folders = this.folders.filter ((f) => f !== folder);

              this.storage.set (`${ADDRESS_FOLDER_KEY}_${id}`, this.addressFolder);
              this.storage.set (`${ADDRESS_FOLDERS_KEY}_${id}`, this.folders);

              this.selectFolder (null);
            });
          }
        }
      ]
    });

    await alert.present ();
  }

  renameFolder (newFolderName: any, modal: IonModal) {
    this.storage.get(CURRENT_COMPANY).then ((id) => {
      for (var address in this.addressFolder) {
        if (this.addressFolder[address] == this.renameFolderName) {
          this.addressFolder[address] = newFolderName;
        }
      }

      this.storage.set (`${ADDRESS_FOLDER_KEY}_${id}`, this.addressFolder);

      this.folders = this.folders.map ((folder) => folder == this.renameFolderName ? newFolderName : folder);
      this.folders.sort ((a,b) => a.localeCompare (b));
      this.storage.set (`${ADDRESS_FOLDERS_KEY}_${id}`, this.folders);

      this.selectFolder (null);

      if (modal) {
        modal.dismiss ();
      }
    });
  }

  setRenameFolderName (folderName: string, event: any = null) {
    if (event) {
      event.preventDefault ();
      event.stopPropagation ();
      event.stopImmediatePropagation ();
    }

    this.renameFolderName = folderName;
  }

  showMoveToFolderModal () {
    document.getElementById ("move-to-folder")?.click ();
  }

  openFolder (folder: string) {
    if (folder) {
      this.currentFolderName = folder;
      this.currentFolder = this.addresses.filter ((address: Address) => this.addressFolder[address.id] == this.currentFolderName);
      this.currentFolder.sort ((a: Address, b: Address) => a.name.localeCompare (b.name));
    } else {
      this.currentFolderName = null;
      setTimeout ( () => {
        this.currentFolder = null;
      }, 400);
    }

    if (this.searchbarElem) {
      this.searchbarElem.value = '';
    }
  }

  selectFolder (folder: string) {
    /* Liste les adresses pas dans une modale
    if (this.currentFolderName === folder) {
      folder = null;
    }
    this.currentFolderName = folder;
    */

    this.displayedAddresses = this.addresses.filter ((address: Address) => this.addressFolder[address.id] == folder);
    this.displayedAddresses.sort ((a: Address, b: Address) => a.name.localeCompare (b.name));

    if (this.searchbarElem) {
      this.searchbarElem.value = '';
    }
  }

  onFolderClick (folder: string, modal: IonModal = null) {
    if (modal) {
      this.moveToFolder (folder, modal);
    } else {
      this.openFolder (folder);
    }
  }

  addressFolderItems (folder: string) {
    return Object.values (this.addressFolder).filter ((f: string) => folder == f).length;
  }

  async moveToFolder (folder: string, modal: any = null, notify: boolean = true) {
    Object.values(this.selectedAddress).forEach ((address: Address) => {
      if (folder == null) {
        delete this.addressFolder[address.id];
      } else {
        this.addressFolder[address.id] = folder;
      }

      this.storage.get(CURRENT_COMPANY).then ((id) => {
        this.storage.set (`${ADDRESS_FOLDER_KEY}_${id}`, this.addressFolder);
      });
    });

    this.selectedAddress = {};

    if (modal) {
      modal.dismiss ();
    }

    this.selectFolder (this.currentFolderName);

    if (notify) {
      const toast = await this.toastController.create({
        message: 'Les adresses ont bien été déplacée dans le dossier ' + folder,
        duration: 5000,
        position: 'bottom',
        icon: 'checkbox-outline',
        cssClass: 'success'
      });

      await toast.present();
    }
  }

  formatPhone (phone: string) {
    return phone.replace (/^\+33/, '0').replace (/\s+/, '').replace (/(\d\d)/g, "$1 ");
  }

  selectAddress (address: Address, event: any, modal: IonModal) {
    if (this.isModal && !event.target.closest (".ion-accordion-toggle-icon")) {
      event.preventDefault ();
      event.stopPropagation ();
      event.stopImmediatePropagation ();
      if (modal) {
        modal.dismiss (address).then (() => {
          this.modalController.dismiss (address);
        })
      } else {
        this.modalController.dismiss (address);
      }
    }
  }

  closeModal () {
    if (this.isModal) {
        this.modalController.dismiss ();
    }
  }
}
