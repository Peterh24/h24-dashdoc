import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertController, IonItemSliding, IonSearchbar, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { CONTACT_FOLDER_KEY, CURRENT_COMPANY, HTTP_REQUEST_UNKNOWN_ERROR } from 'src/app/services/constants';
import { ContactsService } from 'src/app/services/contacts.service';
import { NewContactPage } from './new-contact/new-contact.page';
import { Contact } from '../../models/transport.model';

const DEFAULT_FOLDERS = [
  "Mes loueurs",
  "Mes studios",
  "Mes favorites"
];

@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.page.html',
    styleUrls: ['./contacts.page.scss'],
    standalone: false
})
export class ContactsPage implements OnInit {
  @Input() isModal: boolean;

  contacts: Array<Contact> = [];
  isLoading: boolean = false;
  searchContact: string;
  displayedContacts: any;
  startIndex: number = 0;
  subscription: Subscription;

  currentFolder: string;
  folders: string[] = [];
  contactFolder: Record<string, string>;
  selectedContacts: Record<string, Contact> = {};

  deleteContact: Contact;

  @ViewChild(IonSearchbar) public searchbarElem: IonSearchbar;

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
    this.displayedContacts = [];
    this.contactFolder = {};

    this.isLoading = true;
    this.selectedContacts = {};
    this.currentFolder = null;

    // TODO: verifier si les adresses sont déjà chargées
    this.subscription = this.contactService.fetchContacts().subscribe({
      next: (contacts) => {
        this.isLoading = false;


        this.storage.get(CURRENT_COMPANY).then ((id) => {
          this.storage.get (`${CONTACT_FOLDER_KEY}_${id}`).then ((contactFolder) => {
            /*
            if (contactFolder == null) {
              this.folders = DEFAULT_FOLDERS;
            } else {
              this.contactFolder = contactFolder;
              this.folders = [...new Set (Object.values(contactFolder))];
            }
            */
            this.loadContacts ([...contacts]);
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
    })
  }

  ionViewWillLeave () {
    if (this.subscription) {
      this.subscription.unsubscribe ();
      this.subscription = null;
    }
  }

  handleRefresh(event: CustomEvent) {
    this.ionViewWillEnter ();
    (event.target as HTMLIonRefresherElement).complete();
  }

  loadContacts (contacts: any[]) {
    this.contacts = contacts;
    this.displayedContacts = contacts;

    /*
    DEFAULT_FOLDERS.forEach ((folder) => {
      if (!this.folders.find ((f) => f == folder)) {
        this.folders.push (folder);
      }
    })
      */

    this.folders = [...new Set (contacts.map ((contact) => contact?.company_name))];
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
      this.displayedContacts = this.contacts.filter((item) => {
        return `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
  }

  async onAddContact (contactId: string = null, slidingItem: IonItemSliding = null) {
    const modal = await this.modalController.create({
      component: NewContactPage,
      componentProps: {
        isModal: true,
        contactId: contactId
      },
      cssClass: 'custom',
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      if (contactId) {
        const contactIndex = this.contacts.findIndex ((a) => a.id == contactId);
        this.contacts[contactIndex] = data;
      } else {
        this.contacts.push (data);
      }

      this.selectFolder (null);

      const toast = await this.toastController.create({
        message: 'Le contact a bien été ajouté',
        duration: 3000,
        position: 'bottom',
        icon: 'checkbox-outline',
        cssClass: 'success'
      });

      await toast.present();
    }
  }

  setDeleteContact (contact: any, slidingItem: IonItemSliding = null) {
    this.deleteContact = contact;

    if (slidingItem) {
      slidingItem.close();
    }
  }

  async onRemoveContact(contactId: string, slidingItem: IonItemSliding = null) {
    this.setDeleteContact (null);

    if (slidingItem) {
      slidingItem.close();
    }

    this.contactService.removeContact (contactId).subscribe ({
      next: async () => {
        this.contacts = this.contacts.filter ((c) => c.id != contactId);
        this.selectFolder (null);

        const toast = await this.toastController.create({
          message: 'Le contact a bien été supprimé',
          duration: 3000,
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

  toggleSelectedContact (contact: Contact, event: any) {
    event.preventDefault ();
    event.stopPropagation ();
    if (this.selectedContacts[contact.id]) {
      delete this.selectedContacts[contact.id];
    } else {
      this.selectedContacts[contact.id] = contact;
    }
  }

  haveSelectedContacts () {
    return Object.keys (this.selectedContacts).length > 0;
  }

  createFolder (modal: any, name: any) {
    if (name) {
      this.folders.push (name);
      this.folders.sort ((a,b) => a.localeCompare (b));
    }
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

    this.displayedContacts = this.contacts.filter ((contact: any) => this.currentFolder == null || contact.company_name == this.currentFolder);
    this.displayedContacts.sort ((a: any, b: any) => a.first_name?.localeCompare (b.first_name));

    if (this.searchbarElem) {
      this.searchbarElem.value = '';
    }
  }

  contactsFolderItems (folder: string) {
    return Object.values (this.contactFolder).filter ((f: any) => folder == f).length;
  }

  async moveToFolder (modal: any, folder: string) {
    Object.values(this.selectedContacts).forEach ((contact: Contact) => {
      if (folder == null) {
        delete this.contactFolder[contact.id];
      } else {
        this.contactFolder[contact.id] = folder;
      }

      this.storage.get(CURRENT_COMPANY).then ((id) => {
        this.storage.set (`${CONTACT_FOLDER_KEY}_${id}`, this.contactFolder);
      });
    });

    this.selectedContacts = {};

    modal.dismiss ();

    this.selectFolder (this.currentFolder);

    const toast = await this.toastController.create({
      message: 'Les adresses ont bien été déplacée dans le dossier ' + folder,
      duration: 3000,
      position: 'bottom',
      icon: 'checkbox-outline',
      cssClass: 'success'
    });

    await toast.present();
  }

  formatPhone (phone: string) {
    return phone.replace (/^\+33/, '0').replace (/\s+/, '').replace (/(\d\d)/g, "$1 ");
  }

  selectContact (contact: Contact, event: any) {
    if (this.isModal) {
      event.preventDefault ();
      event.stopPropagation ();
      event.stopImmediatePropagation ();
      this.modalController.dismiss ([ contact ]);
    }
  }

  selectContacts () {
    if (this.isModal) {
      const contacts = Object.values (this.selectedContacts);
      this.modalController.dismiss (contacts);
    }
  }

  closeModal () {
    if (this.isModal) {
        this.modalController.dismiss ();
    }
  }
}
