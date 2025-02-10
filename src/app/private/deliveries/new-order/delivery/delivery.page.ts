import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonInput, ModalController } from '@ionic/angular';
import { TransportService } from 'src/app/services/transport.service';
import { AuthService } from 'src/app/services/auth.service';
import { AddressPage } from 'src/app/private/profile/address/address.page';
import { Storage } from '@ionic/storage-angular';
import { DASHDOC_COMPANY, FILE_UPLOAD_MAX_SIZE } from 'src/app/services/constants';
import { ContactsPage } from 'src/app/private/profile/contacts/contacts.page';
import { ApiTransportService } from 'src/app/services/api-transport.service';

 // TODO gestion des manutentionnaires
 
@Component({
selector: 'app-delivery',
templateUrl: './delivery.page.html',
styleUrls: ['./delivery.page.scss'],
})
export class DeliveryPage implements OnInit, OnChanges {
  @Input() isModal: boolean;
  @Input() delivery: any;
  @Input() defaultContacts: any;
  @Input() deliveryType: string;
  @Input() originMaxSlot: number;
  @Input() destinationMinSlot: number;

  @Output() selectDelivery = new EventEmitter<any>();

  origin: any;
  destination: any;
  enableOrigin: boolean;
  enableDestination: boolean;

  company: any;
  contacts: any[];
  contactsError: string;
  merchandisesUrl = 'assets/merchandises/';
//  merchandisesUrl = 'https://h24-public-app.s3.eu-west-3.amazonaws.com/assets/global/img/';
  merchandiseId: any = {
    'Caméra': 'camera',
    'Lumières': 'light',
//    'Photographie': 'photo',
    'Régie': 'management',
    'Vêtements': 'clothe',
    'Machinerie': 'machinery',
    'Mobilier / Décor': 'furniture',
    'Autres' : 'other'
  };
  merchandises = Object.keys (this.merchandiseId).sort ((a,b) => a.localeCompare(b));
  merchandiseForm: FormGroup;
  merchandisesSelected: any = {};
  merchandiseEdit: string;

  mainForm: FormGroup;
  originForm: FormGroup;
  destinationForm: FormGroup;
  otherForm: FormGroup;

  originErrors: any = {};
  destinationErrors: any = {};
  hasErrors: boolean;

  isDashdocModel = ApiTransportService.isDashdocModel;

  constructor(
    public transport: TransportService,
    public authService: AuthService,
    private modalController: ModalController,
    private storage: Storage,
  ) { 
    this.merchandises.push (this.merchandises.shift());
  }

  ngOnInit () {
    this.ngOnChanges ();
  }

  ngOnChanges () {
    this.reset ();

    this.originForm = new FormGroup({
      reference: new FormControl('', { validators: [] }),
      day: new FormControl(null, { validators: [Validators.required] }),
      time_start: new FormControl(null, { validators: [] }),
      time_end: new FormControl(null, { validators: [] }),
      instructions: new FormControl('', { validators: [] }),
      loads: new FormControl(null, { validators: [] }),
      handlers: new FormControl(0, { validators: [] }),
      guarding: new FormControl(false, { validators: [] }),
      file: new FormControl(null, { validators: [] }),
    });
    this.destinationForm = new FormGroup({
      reference: new FormControl('', { validators: [] }),
      day: new FormControl(null, { validators: [] }),
      time_start: new FormControl(null, { validators: [] }),
      time_end: new FormControl(null, { validators: [] }),
      instructions: new FormControl('', { validators: [] }),
      loads: new FormControl(null, { validators: [] }),
      handlers: new FormControl(0, { validators: [] }),
      guarding: new FormControl(false, { validators: [] }),
      file: new FormControl(null, { validators: [] }),
    });
    this.merchandiseForm = new FormGroup({
      id: new FormControl('', { validators: [] }),
      description: new FormControl('', { validators: [] }),
      category: new FormControl('', { validators: [] }),
      complementary_information: new FormControl('', { validators: [] }),
      quantity: new FormControl('', { validators: [] }),
      weight: new FormControl('', { validators: [] }),
      volume: new FormControl('', { validators: [] }),
      linear_meters: new FormControl('', { validators: [] })
    });
    this.otherForm = new FormGroup({
      loads: new FormControl(null, { validators: [] }),
    })
    this.mainForm = new FormGroup({
      origin: this.originForm,
      destination: this.destinationForm,
      other: this.otherForm,
      merchandise: this.merchandiseForm
    });

    if (this.delivery) {
      this.origin = this.delivery.origin?.address;
      this.destination = this.delivery.destination?.address;
      this.contacts = this.delivery.tracking_contacts;

      this.enableOrigin = !!this.origin;
      this.enableDestination = !!this.destination;

      this.delivery.planned_loads?.forEach ((load: any) => {
        this.merchandisesSelected[load.id] = load;
      });

      const origin = this.loadDelivery(this.originForm, this.delivery.origin);
      const destination = this.loadDelivery(this.destinationForm, this.delivery.destination);

      console.log ('edit', this.delivery);
    } else {
      this.updateEnabled ();
    }

    this.storage.get(DASHDOC_COMPANY).then (pk => { 
      this.company = pk;

      if (!this.contacts?.length) {
        this.contacts = this.defaultContacts || [];
      }

      if (ApiTransportService.isDashdocModel && this.authService.currentUserDetail?.id && !this.contacts?.length) {
        this.contacts = [{
          contact: {
            company: {
              pk: this.company,
            },
            id: this.authService.currentUserDetail.id,
            first_name: this.authService.currentUserDetail.firstname,
            last_name: this.authService.currentUserDetail.lastname,
            email: this.authService.currentUserDetail.email,
            phone_number: this.authService.currentUserDetail.phone
          }
        }];
      }
    });
  }

  reset () {
    this.origin = null;
    this.destination = null;
    this.enableOrigin = false;
    this.enableDestination = false;
    this.company = null;
    this.contacts = null;

    this.originErrors = {};
    this.destinationErrors = {};
    this.contactsError = null;
    this.hasErrors = false;
  }

  loadDelivery (form: FormGroup, delivery: any) {
    if (!delivery) {
      return;
    }

    const parseSlot = (slot: string) => (slot ? slot.split(/T/) : [null, null]);

    let [ start_day, start_time ] = parseSlot(delivery?.slots?.[0]?.start);
    let [ end_day, end_time ] = parseSlot(delivery?.slots?.[0]?.end);

    if (start_time && start_time == end_time) {
      end_time = null;
    }

    const values: any = {
      day: start_day,
      time_start: start_time,
      time_end: end_time,
      instructions: delivery?.instructions,
      reference: delivery?.reference,
      handlers: parseInt(delivery?.handlers) || 0,
      guarding: delivery?.guarding,
      file: delivery?.file
    };
    

    const setSlot = (day: string, control: string) => {
      if (day && values[control]) {
        values[control] = values[control];
      }
    };

    // TODO: les valeurs suivantes ne sont pas initialisées dans le formulaire
    setSlot (start_day, 'time_start');
    setSlot (start_day, 'time_end');

    // TODO: remove that (not required ?)
    form.patchValue (values);
    form.updateValueAndValidity ();
    
    Object.keys (values).forEach ((control) => {
      if (values[control]) {
        form.controls[control].setValue (values[control]);
      }
    });

    return values;
  }

  updateEnabled () {
    if (this.delivery) {
      this.enableOrigin = !!this.origin;
      this.enableDestination = !!this.destination;
    } else if (this.transport.isMultipoint || this.deliveryType === null) {
      this.enableOrigin = this.enableDestination = true;
    } else {
      const origins = this.transport.getOrigins ().length;
      const destinations = this.transport.getDestinations ().length;

      const newOrigins = origins + (this.origin ? 1 : 0);
      const newDestinations = destinations + (this.destination ? 1 : 0);

      if (!this.deliveryType || this.deliveryType == 'origin') {
        if (this.origin || newOrigins < 2 && newDestinations <= 2) {
          this.enableOrigin = true;
        } else {
          this.enableOrigin = !newOrigins || newDestinations <= 1;
        }
      }

      if  (!this.deliveryType || this.deliveryType == 'destination') {
        if (this.destination || newDestinations < 2 && newOrigins <= 2) {
          this.enableDestination = true;
        } else {
          this.enableDestination = !newDestinations || newOrigins <= 1;
        }
      }
    }
  }

  closeModal () {
    this.modalController.dismiss ();
  }

  getMerchandiseUrl (name: string) {
    return this.merchandisesUrl + this.merchandiseId[name] + '.png';
  }

  async setAddress (type: string) {
    const modal = await this.modalController.create({
      component: AddressPage,
      componentProps: {
        isModal: true,
        type
      },
      cssClass: 'custom-big',
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      if (type === 'origin') {
        this.origin = data;
      } else {
        this.destination = data;
      }

      this.updateEnabled ();
    }

    this.validateForm ();
  }

  deleteAddress (type: string) {
    if (type == 'origin') {
      this.origin = null;
    }

    if (type == 'destination') {
      this.destination = null;
    }

    this.updateEnabled ();
  }

  async setContacts () {
    const modal = await this.modalController.create({
      component: ContactsPage,
      componentProps: {
        isModal: true,
      },
      cssClass: 'custom-big',
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      this.contacts = data;
      this.contacts = this.contacts.sort ((a, b) => a.contact.first_name.localeCompare (b.contact.first_name));

      this.updateEnabled ();
    }

    this.validateForm ();
  }

  formatDay (day: string) {
    return new Date (day).toLocaleString (navigator.languages?.[0] || 'fr', { weekday: 'long', day: '2-digit', month: 'long' })
  }

  setDay (form: FormGroup, event: any, modal: any) {
    if (event.target?.value) {
      const day = event.target.value;
      form.controls['day'].setValue (day);
    }

    modal?.dismiss ();

    this.validateForm ();
  }

  // TODO: validation sur le couple day + time
  getDateTimeMin (type: string) {
    if (!this.transport.isMultipoint && type === 'destination' && this.originMaxSlot) {
      return this.originMaxSlot;
    }

    return new Date ().toISOString ().split (/T/)[0];
  }

  getDateTimeMax (type: string) {
    if (!this.transport.isMultipoint && type === 'origin' && this.destinationMinSlot) {
      return this.destinationMinSlot;
    }

    return '4000-01-01T00:00:00';
  }

  isSlotExceeded (date: string) {
    if (!date) {
      return false;
    }

    const day = new Date(date).toISOString ().split (/T/)[0];
    const now = new Date().toISOString ().split (/T/)[0];

    return new Date(day).valueOf() < new Date(now).valueOf ();
  }

  setSlot (form: FormGroup, name: string, event: any) {
    if (event.target?.value) {
      const datetime = event.target.value.split (/T/);
      form.controls[name].setValue (datetime[1].substr (0, 5));
    }

    this.validateForm ();
  }

  setAskHandlers (event: any, form: FormGroup) {
    if (event.detail.checked) {
      form.controls['handlers'].setValue (1);
    } else {
      form.controls['handlers'].setValue (0);
    }
  }

  setAskSecureGuarding (event: any, form: FormGroup) {
    form.controls['guarding'].setValue (event.detail.checked);
  }

  addHandlers (form: FormGroup) {
    form.controls['handlers'].setValue (form.value.handlers + 1);
  }

  resetHandlers (form: FormGroup) {
    form.controls['handlers'].setValue (0);
  }

  getSelectedMerchandises (): any[] {
    return this.merchandisesSelected ? Object.values (this.merchandisesSelected) : [];
  }

  setMerchandiseEdit (description: string) {
    if (description === null) {
      this.merchandiseEdit = null;
      return;
    }

    const id = this.merchandiseId[description];

    const form = this.merchandiseForm;
    const merchandise = this.merchandisesSelected[id] || { id, description, category: 'vrac' };
    this.merchandiseEdit = id;

    Object.keys (form.controls).forEach ((control) => {
      if (merchandise[control]) {
        form.controls[control].setValue (merchandise[control]);
      } else {
        form.controls[control].setValue (null);
      }
    });
  }

  // TODO gestion des pièces jointes
  setMerchandise (modal: any = null) {
    if (modal) {
      modal.dismiss ();
    }

    const merchandise = this.merchandiseForm.value;
    merchandise.id = this.merchandiseId[merchandise.description];
    merchandise.category = 'vrac';
    this.merchandisesSelected[merchandise.id] = merchandise;
  }

  deleteMerchandise (id: any = null, modal: any = null) {
    if (modal) {
      modal.dismiss ();
    }

    delete this.merchandisesSelected[id];
  }

  askFileToUpload (type: string) {
    document.getElementById ("file-upload-" + type).click ();
  }

  onUploadFile (form: FormGroup, event: Event) {
    if ((event.target as HTMLInputElement).files) {
      let input = event.target as HTMLInputElement;
      form.value.file = input.files[0];
    }
  }

  validateFormFile (form: FormGroup, errors: any) {
    delete errors['file'];
    if (form.value.file && form.value.file.size > FILE_UPLOAD_MAX_SIZE) {
      errors['file'] = 'Fichier trop volumineux';
    }
  }

  validateForm () {
    this.originErrors = {};
    this.destinationErrors = {};

    if (this.origin) {
      ['day', 'time_start'].forEach ((control) => {
        if (!this.originForm.value[control]) {
          this.originErrors[control] = true;
        }
      });
    } 
    
    if (this.transport.isMultipoint) {
      if (!this.origin) {
        this.originErrors['address'] = true;
      }

      if (!this.destination) {
        this.destinationErrors['address'] = true;
      }
    } else {
      if (this.deliveryType === 'origin' && !this.origin) {
        this.originErrors['address'] = true;
      }

      if (this.deliveryType === 'destination' && !this.destination) {
        this.destinationErrors['address'] = true;
      }
    }

    if (this.destination) {
      ['day', 'time_start'].forEach ((control) => {
        if (!this.destinationForm.value[control]) {
          this.destinationErrors[control] = true;
        }
      })
    }

    this.validateFormFile (this.originForm, this.originErrors);
    this.validateFormFile (this.destinationForm, this.destinationErrors);

    this.contactsError = this.contacts?.length ? null: 'error';

    this.hasErrors = Object.keys (this.originErrors).length > 0 || 
      Object.keys (this.destinationErrors).length > 0 ||
      this.contactsError != null;

    return !this.hasErrors;
  }

  isFormValid () {
    const value = this.mainForm.value;

    const originValid = this.origin && value.origin_day && value.origin_time_start && value.origin_time_end;
    const destinationValid = this.destination && value.destination_day && value.destination_time_start && value.destination_time_end;
    const loadsValid = this.origin && Object.keys (this.merchandisesSelected).length;

    return originValid && destinationValid && loadsValid ||
      !this.transport.isMultipoint && this.origin && originValid && loadsValid ||
      !this.transport.isMultipoint && this.destination && destinationValid;
  }
  
  onSubmit () {
    let origin, destination, planned_loads: any;

    if (!this.validateForm ()) {
      return;
    }

    if (this.origin) {
      origin = this.buildDelivery (this.originForm.value, this.origin);

      planned_loads =  Object.values (this.merchandisesSelected);
    }

    if (this.destination) {
      destination = this.buildDelivery (this.destinationForm.value, this.destination);
    }

    if (this.delivery) {
      if (this.delivery.origin) {
        this.delivery.origin = this.buildDelivery (this.originForm.value, this.origin);
      }
      if (this.delivery.destination) {
        this.delivery.destination = this.buildDelivery (this.destinationForm.value, this.destination);
      }
      this.delivery.planned_loads = planned_loads || [];
      this.delivery.tracking_contacts = this.contacts;
    }

    console.log ('submit', { origin, destination, planned_loads });

    const delivery = { 
      origin,
      destination,
      planned_loads, // TODO doit être défini pour les enlèvements uniquement
      tracking_contacts: this.contacts
    };

    this.selectDelivery.emit (delivery);

    if (this.isModal) {
      this.modalController.dismiss (delivery);
    }
  }

  buildDelivery (values: any, address: any) {
    const slots = [];

    if (values.day) {
      const day = values.day.split (/T/)[0];

      slots.push (
          {
            start: day + 'T' + values.time_start?.substr(0, 5),
            end: values.time_end ? day + 'T' + values.time_end?.substr(0, 5) : day + 'T' + values.time_start?.substr(0, 5),
          }
      );
    }

    return {
      address: this.buildAddress(address),
      instructions: values.instructions,
      reference: values.reference,
      slots: slots,
      handlers: values.handlers || 0,
      guarding: values.guarding,
      file: values.file
    };
  }

  buildAddress (address: any) {
    if (!address) return null;

    return {
      "pk": address.pk,
      "name": address.name,
      "address": address.address,
      "city": address.city,
      "postcode": address.postcode,
      "country": address.country,
      "latitude": address.latitude,
      "longitude": address.longitude,
    }
  }
}
