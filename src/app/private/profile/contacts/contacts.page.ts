import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AddressService } from 'src/app/services/address.service';
import { AlertController, IonItemSliding, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { CONTACT_FOLDER_KEY, DASHDOC_COMPANY, USER_STORAGE_KEY } from 'src/app/services/constants';
import { Contact } from './contact.model';
import { ContactsService } from 'src/app/services/contacts.service';

const DEFAULT_FOLDERS = [
  "Mes loueurs",
  "Mes studios",
  "Mes favorites"
];

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {
  @Input() isModal: boolean;

  private addressSub: Subscription;
  contacts: Array<Contact> = [];
  isLoading: boolean = false;
  searchContact: string;
  jsonData: any;
  startIndex: number = 0;

  currentFolder: string;
  folders: any[] = [];
  contactFolder: any;
  selectedContacts: any = {};

  @ViewChild("searchbarElem", { read: ElementRef }) private searchbarElem: ElementRef;
  constructor(
    private contactService: ContactsService,
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
    this.contacts = [];
    this.jsonData = [];
    this.contactFolder = {};
    this.storage.get(USER_STORAGE_KEY).then(token => {

    })

    this.isLoading = true;
    this.selectedContacts = {};
    this.currentFolder = null;

    // TODO: verifier si les adresses sont déjà chargées
    this.contactService.fetchContacts().subscribe({
      next: (contacts) => {
        this.isLoading = false;

        
        this.storage.get(DASHDOC_COMPANY).then ((pk) => {
          this.storage.get (`${CONTACT_FOLDER_KEY}_${pk}`).then ((contactFolder) => {
            /*
            if (contactFolder == null) {
              this.folders = DEFAULT_FOLDERS;
            } else {
              this.contactFolder = contactFolder;
              this.folders = [...new Set (Object.values(contactFolder))];
            }
            */
            this.loadContacts (contacts);
          })
        });
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  loadContacts (contacts: any[]) {
    this.contacts = contacts;
    this.jsonData = contacts;

    /*
    DEFAULT_FOLDERS.forEach ((folder) => {
      if (!this.folders.find ((f) => f == folder)) {
        this.folders.push (folder);
      }
    })
      */
    
    this.folders = [...new Set (contacts.map ((contact) => contact?.companyName))];
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
      this.jsonData = this.contacts.filter((item) => {
        return `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
  }

  onEdit(contactId: number, slidingItem: IonItemSliding){
    slidingItem.close();
    this.router.navigate(['/private/tabs/profile/contacts/edit-contact', contactId]);
  }

  onRemoveContact(contactPk: number, slidingElement: IonItemSliding): void {
  }

  toggleSelectedContact (contact: any, event: any) {
    event.preventDefault ();
    event.stopPropagation ();
    if (this.selectedContacts[contact.pk]) {
      delete this.selectedContacts[contact.pk];
    } else {
      this.selectedContacts[contact.pk] = contact;
    }
  }

  haveSelectedContacts () {
    return Object.keys (this.selectedContacts).length > 0;
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

    this.jsonData = this.contacts.filter ((contact: any) => this.currentFolder == null || contact.companyName == this.currentFolder);
    this.jsonData.sort ((a: any, b: any) => a.firstName?.localeCompare (b.firstName));

    if (this.searchbarElem?.nativeElement) {
      this.searchbarElem.nativeElement.value = '';
    }
  }

  contactsFolderItems (folder: string) {
    return Object.values (this.contactFolder).filter ((f: any) => folder == f).length;
  }

  async moveToFolder (modal: any, folder: string) {
    Object.values(this.selectedContacts).forEach ((contact: any) => {
      if (folder == null) {
        delete this.contactFolder[contact.pk];
      } else {
        this.contactFolder[contact.pk] = folder;
      }
      
      this.storage.get(DASHDOC_COMPANY).then ((pk) => {
        this.storage.set (`${CONTACT_FOLDER_KEY}_${pk}`, this.contactFolder);
      });
    });

    this.selectedContacts = {};

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

  selectContact (contact: any, event: any) {
    /*
    if (this.isModal) {
      event.preventDefault ();
      event.stopPropagation ();
      event.stopImmediatePropagation ();
      this.modalController.dismiss (contact);
    }
    */
  }

  selectContacts () {
    if (this.isModal) {
      this.modalController.dismiss (Object.values (this.selectedContacts));
    }
  }

  closeModal () {
    if (this.isModal) {
        this.modalController.dismiss ();
    }
  }
}
