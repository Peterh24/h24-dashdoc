import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemReorderEventDetail, ModalController } from '@ionic/angular';
import { EMPTY, Subscription, catchError, of, switchMap, take } from 'rxjs';
import { AddressService } from 'src/app/services/address.service';
import { TransportService } from 'src/app/services/transport.service';
import { UtilsService } from 'src/app/utils/services/utils.service';
import { HourComponent } from '../pick-up/hour/hour.component';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ModalCourseComponent } from '../merchandise/modal-course/modal-course.component';
import { NewAddressPage } from 'src/app/private/profile/address/new-address/new-address.page';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.page.html',
  styleUrls: ['./delivery.page.scss'],
})
export class DeliveryPage implements OnInit {
  private addressSub: Subscription;
  address: Array<any> = [];
  isNewAddress:boolean = false;
  isLoading: boolean = false;
  isSingleOrigin = false;
  addressSelected:Array<any> = [];
  isReorderDisabled = true;
  selectedAccordionPk: any = null;
  date: string;
  hour: string;
  form = this.formBuilder.nonNullable.group({
    date: ['', [Validators.required]],
    hour: ['', [Validators.required]],
    instruction: [''],
  });
  constructor(
    private formBuilder: FormBuilder,
    private transportService: TransportService,
    private addressService: AddressService,
    private router: Router,
    private utilsService: UtilsService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    if(this.transportService.deliveries.length <= 0) {
      this.router.navigateByUrl('/private/tabs/transports/new-delivery/vehicle-choice')
    }
  }

  ionViewWillEnter() {
    this.isSingleOrigin = this.utilsService.areAllValuesIdentical(this.transportService.deliveries, 'origin', 'address');
    this.isLoading = true;
    this.addressSub = this.addressService.address
      .pipe(
        switchMap(address => {
          if (address.length > 0) {
            return of(address);
          } else {
            this.router.navigateByUrl('/private/tabs/transports/new-delivery/vehicle-choice')
            return EMPTY
          }
        })
      )
      .subscribe(addresses => {
        this.address = addresses;
        this.isLoading = false;

        this.addAddressCard();
      });
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    const fromIndex = ev.detail.from;
    const toIndex = ev.detail.to;

    if (fromIndex !== toIndex) {
      // Réorganise les éléments dans le tableau deliveries
      const [movedItem] = this.transportService.deliveries.splice(fromIndex, 1);
      this.transportService.deliveries.splice(toIndex, 0, movedItem);
    }

    // Complète le déplacement
    ev.detail.complete();
  }

  getCountry(countryCode: string): string {
    return countryCode;
  }

  removeSelectedAddress(addressPk: any) {
    const indexAddressSelected = this.addressSelected.findIndex(selected => selected.address.pk === addressPk);
    if (indexAddressSelected !== -1) {
      this.addressSelected.splice(indexAddressSelected, 1);

      const indexDelivery = this.transportService.deliveries.findIndex(delivery => delivery.destination.address.pk === addressPk);
      if (indexDelivery !== -1) {
        this.transportService.deliveries.splice(indexDelivery, 1);
      }
    }
  }

  addressIsSelected(addressPk: any): boolean {
    return this.addressSelected.some(selected => selected.pk === addressPk);
  }

  toggleReorder() {
    this.isReorderDisabled = !this.isReorderDisabled;
  }

  onSelectedAddress(addressPk: any) {
    this.selectedAccordionPk = addressPk;

    this.addressService.getAddress(addressPk).pipe(take(1)).subscribe((address) => {
      const slotDate = this.date + 'T' + this.hour;

      // Constructing the origin object
      const course = {
        "address": {
          "pk": address.pk,
          "name": address.name,
          "address": address.address,
          "city": address.city,
          "postcode": address.postcode,
          "country": address.country,
          "latitude": address.latitude,
          "longitude": address.longitude,
        },
        instructions: this.form.get('instruction').value,
        "slots": [
          {
            "start": slotDate,
            "end": slotDate
          }
        ]
      };


      if(!this.isSingleOrigin) {
        this.transportService.deliveries.forEach(delivery => {
          delivery.destination = course;
          this.router.navigateByUrl('/private/tabs/transports/new-delivery/summary');
        })
      } else {
        console.log('this.transportService.deliveries[0]: ', this.transportService.deliveries[0].destination);
        if (this.transportService.deliveries[0].destination) {
          const firstOrigin = this.transportService.deliveries[0].origin;
          const loads = this.transportService.deliveries[0].planned_loads;

          const newDelivery = {
            origin: firstOrigin,
            destination: course,
            planned_loads: loads
          }
          // If destination is already present we can push new delivery
          this.transportService.deliveries.push(newDelivery);

        } else {
          // If destination never set we add the destination on the first delivery
          this.transportService.deliveries[0].destination = course;
        }
        this.openPopupAdd();
      }
      console.log('deliveries: ', this.transportService.deliveries);
    })
  }

  async openDatePicker(type: string) {
    if (type === 'time' && !this.form.get('date').value) {
      return;
    }

    const modal = await this.modalController.create({
      component: HourComponent,
      componentProps: {
        type: type,
        page: 'destination',
        form: this.form,
        initialBreakpoint: 1,
        breakpoints: [0, 1]
      },
    })
    modal.present();
    const { data } = await modal.onWillDismiss();
    if(data) {
      if(type === 'date') {
        const date = format(new Date(data), "yyyy-MM-dd");
        const formatedDate = format(parseISO(date), 'dd MMMM yyyy', { locale: fr });
        this.date = date;
        this.form.controls['date'].setValue(date);
      } else {
        const hour = format(new Date(data), "HH:mm");
        this.hour = hour;
        this.form.controls['hour'].setValue(hour);
      }
    }
  }

  async openPopupAdd(){
    const modalCourse = await this.modalController.create({
      component: ModalCourseComponent,
      componentProps: {
        type: 'destination',
      },
      cssClass: 'course-modal',
      mode: 'ios'
    });
    modalCourse.present();
    const { data } = await modalCourse.onWillDismiss();

    if (data.choice !== 'yes') {
      this.router.navigateByUrl('/private/tabs/transports/new-delivery/summary');
    } else {
      this.addAddressCard();
    }
  }


  addAddressCard() {
    if (this.transportService.deliveries.length > 0) {
      this.transportService.deliveries.forEach(delivery => {
        if (delivery.destination) {
          const destinationAddress = delivery.destination.address;
          const destinationDate = delivery.destination.slots[0].start;

          const existingSelected = this.addressSelected.find(selected => selected.address.pk === destinationAddress.pk);

          if (!existingSelected) {
            this.addressSelected.push({ address: destinationAddress, date: format(new Date(destinationDate), 'dd-MM-yyyy HH:mm') });
          }
        }
      });
    }
  }

  resetField(){
    this.form.reset();
  }

  async addAddress() {
    const modal = await this.modalController.create({
      component: NewAddressPage,
      componentProps: {
        isModal: true,
      }
    })
    modal.present();
    await modal.onWillDismiss();

  }

  ionViewDidLeave() {
    if(this.addressSub) {
      this.addressSub.unsubscribe();
    }
  }
}
