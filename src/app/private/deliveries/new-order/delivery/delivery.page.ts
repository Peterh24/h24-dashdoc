import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonInput, ModalController } from '@ionic/angular';
import { AddressPage } from '../address/address.page';
import { TransportService } from 'src/app/services/transport.service';

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

  contact: any;
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

  mainForm: FormGroup;
  originForm: FormGroup;
  destinationForm: FormGroup;
  otherForm: FormGroup;

  originErrors: any = {};
  destinationErrors: any = {};
  hasErrors: boolean;

  @ViewChild('merchandisesOther') merchandiseOther: IonInput;

  constructor(
    public transport: TransportService,
    private modalController: ModalController
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
    console.log (1, this.delivery, this.deliveryType);
    console.log (2, this.originMaxSlot, this.destinationMinSlot);

    this.originErrors = {};
    this.destinationErrors = {};
    this.hasErrors = false;

    if (this.delivery) {
      this.origin = this.delivery.origin?.address;
      this.destination = this.delivery.destination?.address;

      this.enableOrigin = !!this.origin;
      this.enableDestination = !!this.destination;

      this.delivery.planned_loads?.forEach ((load: any) => {
        this.merchandisesSelected[load.description] = true;
      });

      setTimeout (() => {
        if (this.merchandiseOther) {
          this.merchandiseOther.value = this.delivery.planned_loads_other;
        }
      }, 200);

      const origin = this.loadDelivery(this.originForm, this.delivery.origin);
      const destination = this.loadDelivery(this.destinationForm, this.delivery.destination);

      console.log ('edit', origin, destination);

      this.fileToUpload = this.delivery.file;
    } else {
      this.updateEnabled ();
    }
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
      handlers: delivery?.handlers,
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
    if (this.transport.isMultipoint) {
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
    console.log (999);

    const modal = await this.modalController.create({
      component: AddressPage,
      componentProps: {
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

    console.log (type, data);

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

    return '1900-01-01T00:00:00';
  }

  getDateTimeMax (type: string) {
    if (!this.transport.isMultipoint && type === 'origin' && this.destinationMinSlot) {
      return this.destinationMinSlot;
    }

    return '4000-01-01T00:00:00';
  }

  setSlot (form: FormGroup, name: string, event: any) {
    console.log (2, event.target?.value);
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
    this.merchandisesSelected[name] = !this.merchandisesSelected[name];
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

    if (this.destination) {
      ['day', 'time_start'].forEach ((control) => {
        if (!this.destinationForm.value[control]) {
          this.destinationErrors[control] = true;
        }
      })
    }

    this.hasErrors = Object.keys (this.originErrors).length > 0 || Object.keys (this.destinationErrors).length > 0;

    console.log (this.hasErrors, this.originErrors, this.destinationErrors);
    
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
    let origin, destination, planned_loads;

    if (!this.validateForm ()) {
      return;
    }

    if (this.origin) {
      origin = this.buildDelivery (this.originForm.value, this.origin);

      planned_loads =  Object.keys (this.merchandisesSelected).map ((name) => ({
        id: this.merchandiseIcon[name],
        description: name,
        category: 'bulk'
      }));
    }

    if (this.destination) {
      destination = this.buildDelivery (this.destinationForm.value, this.destination);
    }

    console.log (2, { origin, destination, planned_loads });

    if (this.delivery) {
      this.delivery.origin = origin;
      this.delivery.destination = destination;
      this.delivery.planned_loads = planned_loads;
      if (this.merchandiseOther?.value) {
        this.delivery.planned_loads_other = this.merchandiseOther.value;
      }
      if (this.fileToUpload) {
        this.delivery.file = this.fileToUpload;
      }
    }

    this.modalController.dismiss ({ 
      origin,
      destination,
      planned_loads,
      planned_loads_other: this.merchandiseOther?.value,
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
      handlers: values.handlers,
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
