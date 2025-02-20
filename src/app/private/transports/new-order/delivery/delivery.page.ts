import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Storage } from '@ionic/storage-angular';
import { CURRENT_COMPANY, FILE_UPLOAD_MAX_SIZE } from 'src/app/services/constants';
import { ContactsPage } from 'src/app/private/profile/contacts/contacts.page';
import { FileUtils } from 'src/app/utils/file-utils';
import { TransportOrderService } from 'src/app/services/transport-order.service';
import { Address, Contact, Delivery, Load, Site } from 'src/app/private/models/transport.model';
import { IonModal } from '@ionic/angular/common';
import { AddressPage } from 'src/app/private/profile/address/address.page';

@Component({
selector: 'app-delivery',
templateUrl: './delivery.page.html',
styleUrls: ['./delivery.page.scss'],
})
export class DeliveryPage implements OnInit, OnChanges {
  @Input() isModal: boolean;
  @Input() delivery: Delivery;
  @Input() defaultContacts: Contact[];
  @Input() deliveryType: string;
  @Input() originMaxSlot: number;
  @Input() destinationMinSlot: number;

  @Output() selectDelivery = new EventEmitter<any>();

  origin: Address;
  destination: Address;
  enableOrigin: boolean;
  enableDestination: boolean;

  company: number;
  contacts: Contact[];
  contactsError: string;
  merchandisesUrl = 'assets/merchandises/';
//  merchandisesUrl = 'https://h24-public-app.s3.eu-west-3.amazonaws.com/assets/global/img/';
  merchandiseIcon: Record<string, string> = {
    'Caméra': 'camera',
    'Lumières': 'light',
//    'Photographie': 'photo',
    'Régie': 'management',
    'Vêtements': 'clothe',
    'Machinerie': 'machinery',
    'Mobilier / Décor': 'furniture',
  };
  merchandises: string[];
  merchandiseForm: FormGroup;
  merchandisesSelected: Record<string, Load> = {};
  merchandiseEdit: string;

  mainForm: FormGroup;
  originForm: FormGroup;
  destinationForm: FormGroup;
  otherForm: FormGroup;

  originErrors: Record<string, boolean> = {};
  destinationErrors: Record<string, boolean> = {};
  hasErrors: boolean;

  constructor(
    public transportOrderService: TransportOrderService,
    public authService: AuthService,
    private modalController: ModalController,
    private storage: Storage,
  ) {

  }

  ngOnInit () {
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

    this.merchandises = Object.keys (this.merchandiseIcon);
    this.merchandises.push (this.merchandises.shift());

    if (this.delivery) {
      this.origin = this.delivery.origin?.address;
      this.destination = this.delivery.destination?.address;
      this.contacts = this.delivery.tracking_contacts;

      this.enableOrigin = this.transportOrderService.isMultipoint || !!this.origin;
      this.enableDestination = this.transportOrderService.isMultipoint || !!this.destination;

      this.delivery.planned_loads?.forEach ((load: Load) => {
        this.merchandisesSelected[load.description] = load;

        if (!this.merchandises.includes (load.description)) {
          this.merchandises.push (load.description);
        }
      });

      const origin = this.loadSite (this.originForm, this.delivery.origin);
      const destination = this.loadSite (this.destinationForm, this.delivery.destination);

      console.log ('edit', this.delivery);
    } else {
      this.updateEnabled ();
    }

    this.merchandises = this.merchandises.sort ((a,b) => a.localeCompare(b));
    this.merchandises.push ('Autre');

    this.storage.get(CURRENT_COMPANY).then (id => {
      this.company = id;

      if (!this.contacts?.length) {
        this.contacts = this.defaultContacts || [];
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

    this.merchandises = [];
    this.merchandisesSelected = {};
    this.merchandiseEdit = null;
  }

  loadSite (form: FormGroup, site: Site) {
    if (!site) {
      return;
    }

    const parseSlot = (slot: string) => (slot ? slot.split(/T/) : [null, null]);

    let [ start_day, start_time ] = parseSlot(site?.slots?.[0]?.start);
    let [ end_day, end_time ] = parseSlot(site?.slots?.[0]?.end);

    if (start_time && start_time == end_time) {
      end_time = null;
    }

    const values: any = {
      day: start_day,
      time_start: start_time,
      time_end: end_time,
      instructions: site?.instructions,
      reference: site?.reference,
      handlers: site?.handlers,
      guarding: site?.guarding,
      file: site?.file
    };


    const setSlot = (day: string, control: string) => {
      if (day && values[control]) {
        values[control] = values[control];
      }
    };

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
    if (this.transportOrderService.isMultipoint || this.deliveryType === null) {
      this.enableOrigin = this.enableDestination = true;
    } else if (this.delivery) {
      this.enableOrigin = !!this.origin;
      this.enableDestination = !!this.destination;
    } else {
      const origins = this.transportOrderService.getOrigins ().length;
      const destinations = this.transportOrderService.getDestinations ().length;

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

  getMerchandiseIcon (description: string) {
    return this.merchandiseIcon[description] || 'other';
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
      this.contacts = this.contacts.sort ((a, b) => a.first_name.localeCompare (b.first_name));

      this.updateEnabled ();
    }

    this.validateForm ();
  }

  formatDay (day: string) {
    return new Date (day).toLocaleString (navigator.languages?.[0] || 'fr', { weekday: 'long', day: '2-digit', month: 'long' })
  }

  setDay (form: FormGroup, event: Event, modal: IonModal) {
    const target = event.target as HTMLInputElement;

    if (target.value) {
      const day = target.value;
      form.controls['day'].setValue (day);
    }

    modal?.dismiss ();

    this.validateForm ();
  }

  // TODO: validation sur le couple day + time
  getDateTimeMin (type: string) {
    if (!this.transportOrderService.isMultipoint && type === 'destination' && this.originMaxSlot) {
      return this.originMaxSlot;
    }

    return new Date ().toISOString ().split (/T/)[0];
  }

  getDateTimeMax (type: string) {
    if (!this.transportOrderService.isMultipoint && type === 'origin' && this.destinationMinSlot) {
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

  setSlot (form: FormGroup, name: string, event: Event) {
    const target = event.target as HTMLInputElement;

    if (target?.value) {
      const datetime = target.value.split (/T/);
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

  getSelectedMerchandises (): Load[] {
    return this.merchandisesSelected ? Object.values (this.merchandisesSelected) : [];
  }

  setMerchandiseEdit (description: string) {
    if (description === null) {
      this.merchandiseEdit = null;
      return;
    }

    const form = this.merchandiseForm;
    const merchandise: any = this.merchandisesSelected[description] || { description, category: 'vrac' };
    this.merchandiseEdit = description;

    Object.keys (form.controls).forEach ((control) => {
      if (merchandise[control]) {
        form.controls[control].setValue (merchandise[control]);
      } else {
        form.controls[control].setValue (null);
      }
    });
  }

  // TODO gestion des pièces jointes
  setMerchandise (modal: IonModal = null) {
    if (modal) {
      modal.dismiss ();
    }

    const merchandise = this.merchandiseForm.value;
    merchandise.id = this.merchandiseIcon[merchandise.description];
    merchandise.category = 'vrac';
    this.merchandisesSelected[merchandise.description] = merchandise;
    this.validateForm ();
  }

  deleteMerchandise (merchandise: Load = null, modal: IonModal = null) {
    if (modal) {
      modal.dismiss ();
    }

    delete this.merchandisesSelected[merchandise.description];
    this.validateForm ();
  }

  askFileToUpload (type: string) {
    document.getElementById ("file-upload-" + type).click ();
  }

  async onUploadFile (form: FormGroup, event: Event) {
    const fileUtils = new FileUtils ();
    if ((event.target as HTMLInputElement).files) {
      let input = event.target as HTMLInputElement;
      form.value.file = await fileUtils.loadFile (input.files[0]);
    }
  }

  deleteUploadFile (form: FormGroup, event: Event) {
    event.preventDefault ();
    event.stopPropagation ();

    form.value.file = null;
  }

  validateFormFile (form: FormGroup, errors: Record<string, boolean>) {
    delete errors['file'];
    if (form.value.file && form.value.file.size > FILE_UPLOAD_MAX_SIZE) {
      errors['file'] = true;
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

      if (!Object.keys (this.merchandisesSelected).length) {
        this.originErrors['loads'] = true;
      }
    }

    if (this.transportOrderService.isMultipoint) {
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

  onSubmit () {
    let origin: Site, destination: Site, planned_loads: Load[];

    /*
    if (!this.validateForm ()) {
      return;
    }
    */

    if (this.origin) {
      origin = this.buildDelivery (this.originForm.value, this.origin);
      planned_loads =  Object.values (this.merchandisesSelected);
    }

    if (this.destination) {
      destination = this.buildDelivery (this.destinationForm.value, this.destination);
    }

    let delivery: Delivery;

    if (this.delivery) {
      delivery = this.delivery;

      if (origin) {
        delivery.origin = origin;
      }
      if (destination) {
        delivery.destination = destination;
      }
      delivery.planned_loads = planned_loads || [];
      delivery.tracking_contacts = this.contacts;
    } else {
      delivery = new Delivery (
        '1',
        origin,
        destination,
        null,
        this.contacts,
        null,
        null
      );

      if (origin) {
        delivery.planned_loads = planned_loads || [];
      }
    }

    console.log ('submit', { origin, destination, planned_loads });

    this.selectDelivery.emit (delivery);

    if (this.isModal) {
      this.modalController.dismiss (delivery);
    }
  }

  buildDelivery (values: any, address: Address) {
    const slots = [];

    if (values.day && values.time_start) {
      const day = values.day.split (/T/)[0];

      slots.push (
          {
            start: day + 'T' + values.time_start?.substr(0, 5),
            end: values.time_end ? day + 'T' + values.time_end?.substr(0, 5) : day + 'T' + values.time_start?.substr(0, 5),
          }
      );
    }

    return new Site (
      '0',
      address,
      slots,
      values.instructions,
      values.reference,
      values.handlers || 0,
      values.guarding,
      values.file
    );
  }
}
