import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonInput, ModalController } from '@ionic/angular';
import { TransportService } from 'src/app/services/transport.service';
import { AuthService } from 'src/app/services/auth.service';
import { AddressPage } from 'src/app/private/profile/address/address.page';
import { Storage } from '@ionic/storage-angular';
import { DASHDOC_COMPANY, FILE_UPLOAD_MAX_SIZE } from 'src/app/services/constants';

@Component({
selector: 'app-delivery',
templateUrl: './delivery.page.html',
styleUrls: ['./delivery.page.scss'],
})
export class DeliveryPage implements OnInit {
  @Input() delivery: any;
  @Input() deliveryType: string;
  @Input() originMaxSlot: number;
  @Input() destinationMinSlot: number;

  origin: any;
  destination: any;
  enableOrigin: boolean;
  enableDestination: boolean;

  company: any;
  contacts: any[];
  merchandisesUrl = 'https://h24-public-app.s3.eu-west-3.amazonaws.com/assets/global/img/';
  merchandiseIcon: any = {
    'Caméra': 'camera',
    'Lumières': 'light',
    'Photographie': 'photo',
    'Régie': 'management',
    'Vêtements': 'clothe',
    'Machinerie': 'machinery',
    'Mobilier / Décor': 'furniture'
  };
  merchandises = Object.keys (this.merchandiseIcon).sort ((a,b) => a.localeCompare(b));
  merchandisesSelected: any = {};

  fileToUpload: any;
  fileToUploadError: string;

  mainForm: FormGroup;
  originForm: FormGroup;
  destinationForm: FormGroup;
  otherForm: FormGroup;

  originErrors: any = {};
  destinationErrors: any = {};
  hasErrors: boolean;

  @ViewChild('merchandisesCustom') merchandisesCustom: IonInput;

  constructor(
    public transport: TransportService,
    public authService: AuthService,
    private modalController: ModalController,
    private storage: Storage,
  ) { }

  ngOnInit () {
    this.originForm = new FormGroup({
      reference: new FormControl(null, { validators: [] }),
      day: new FormControl(null, { validators: [Validators.required] }),
      time_start: new FormControl(null, { validators: [] }),
      time_end: new FormControl(null, { validators: [] }),
      instructions: new FormControl(null, { validators: [] }),
      loads: new FormControl(null, { validators: [] }),
      handlers: new FormControl(0, { validators: [] }),
    });
    this.destinationForm = new FormGroup({
      reference: new FormControl(null, { validators: [] }),
      day: new FormControl(null, { validators: [] }),
      time_start: new FormControl(null, { validators: [] }),
      time_end: new FormControl(null, { validators: [] }),
      instructions: new FormControl(null, { validators: [] }),
      loads: new FormControl(null, { validators: [] }),
      handlers: new FormControl(0, { validators: [] }),
    });
    this.otherForm = new FormGroup({
      loads: new FormControl(null, { validators: [] }),
    })
    this.mainForm = new FormGroup({
      origin: this.originForm,
      destination: this.destinationForm,
      other: this.otherForm
    });
  }

  ionViewWillEnter() {
    this.originErrors = {};
    this.destinationErrors = {};
    this.hasErrors = false;

    this.contacts = [{
      contact: {
        company: {
          pk: this.company,
        },
        first_name: this.authService.currentUserDetail.firstname,
        last_name: this.authService.currentUserDetail.lastname,
        email: this.authService.currentUserDetail.email,
        phone_number: this.authService.currentUserDetail.phone
      }
    }];

    if (this.delivery) {
      this.origin = this.delivery.origin?.address;
      this.destination = this.delivery.destination?.address;
      if (this.delivery.tracking_contacts?.email) {
        this.contacts = this.delivery.tracking_contacts;
      }

      this.enableOrigin = !!this.origin;
      this.enableDestination = !!this.destination;

      this.delivery.planned_loads?.filter ((l: any) => l.id != 'custom').forEach ((load: any) => {
        this.merchandisesSelected[load.description] = true;
      });

      const customLoad = this.delivery.planned_loads?.find ((d: any) => d.id == 'custom');

      if (customLoad) {
        setTimeout (() => {
          if (this.merchandisesCustom) {
            this.merchandisesCustom.value = customLoad?.description;
          }
        }, 200);
      }

      const origin = this.loadDelivery(this.originForm, this.delivery.origin);
      const destination = this.loadDelivery(this.destinationForm, this.delivery.destination);

      console.log ('edit', this.delivery);

      this.fileToUpload = this.delivery.file;
    } else {
      this.updateEnabled ();
    }

    this.storage.get(DASHDOC_COMPANY).then (pk => { this.company = pk });
  }

  loadDelivery (form: FormGroup, delivery: any) {
    if (!delivery) {
      return;
    }

    const parseSlot = (slot: string) => (slot ? slot.split(/T/) : [null, null]);

    const [ start_day, start_time ] = parseSlot(delivery?.slots?.[0]?.start);
    const [ end_day, end_time ] = parseSlot(delivery?.slots?.[0]?.end);

    const values: any = {
      day: start_day,
      time_start: start_time,
      time_end: end_time,
      instructions: delivery?.instructions,
      reference: delivery?.reference,
      handlers: delivery?.handlers || 0,
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
    return this.merchandisesUrl + this.merchandiseIcon[name] + '.png';
  }

  async setAddress (type: string) {
    const modal = await this.modalController.create({
      component: AddressPage,
      componentProps: {
        isModal: true,
        type
      },
      cssClass: 'address-modal',
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (type === 'origin') {
      this.origin = data;
    } else {
      this.destination = data;
    }

    this.updateEnabled ();
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

  async setContact () {
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

  setSlot (form: FormGroup, name: string, event: any) {
    if (event.target?.value) {
      const datetime = event.target.value.split (/T/);
      form.controls[name].setValue (datetime[1].substr (0, 5));
    }

    this.validateForm ();
  }

  addHandlers (form: FormGroup) {
    form.controls['handlers'].setValue (form.value.handlers + 1);
  }

  resetHandlers (form: FormGroup) {
    form.controls['handlers'].setValue (0);
  }

  toggleMerchandise (name: string) {
    if (this.merchandisesSelected[name]) {
      delete this.merchandisesSelected[name];
    } else {
      this.merchandisesSelected[name] = true; 
    }
  }

  askFileToUpload () {
    document.getElementById ("file-upload").click ();
  }

  onUploadFile (event: Event) {
    if ((event.target as HTMLInputElement).files) {
      let input = event.target as HTMLInputElement;
      this.fileToUpload = input.files[0];
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
      })
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

    this.fileToUploadError = null;
    if (this.fileToUpload && this.fileToUpload.size > FILE_UPLOAD_MAX_SIZE) {
      this.fileToUploadError = 'Fichier non valide';
    }

    this.hasErrors = Object.keys (this.originErrors).length > 0 || 
      Object.keys (this.destinationErrors).length > 0 ||
      this.fileToUploadError != null;
    
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

      planned_loads =  Object.keys (this.merchandisesSelected).map ((name) => ({
        id: this.merchandiseIcon[name],
        description: name,
        category: 'bulk',
        quantity: 1
      }));

      if (this.merchandisesCustom?.value) {
        planned_loads.push({
          id: 'custom',
          description: this.merchandisesCustom.value,
          category: 'bulk',
          quantity: 1
          });
      }
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

      if (this.fileToUpload) {
        this.delivery.file = this.fileToUpload;
      }
    }

    console.log ('submit', { origin, destination, planned_loads });

    this.modalController.dismiss ({ 
      origin,
      destination,
      planned_loads,
      tracking_contacts: this.contacts,
      file: this.fileToUpload 
    });
  }

  buildDelivery (values: any, address: any) {
    const slots = [];

    if (values.day) {
      const day = values.day.split (/T/)[0];

      slots.push (
          {
            start: values.time_start ? day + 'T' + values.time_start?.substr(0, 5) : null,
            end: values.time_end ? day + 'T' + values.time_end?.substr(0, 5) : null,
          }
      );
    }

    return {
      address: this.buildAddress(address),
      instructions: values.instructions,
      reference: values.reference,
      slots: slots,
      handlers: values.handlers || 0,
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
