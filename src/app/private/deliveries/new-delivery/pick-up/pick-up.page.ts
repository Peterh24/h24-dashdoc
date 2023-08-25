import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ItemReorderEventDetail, LoadingController, ModalController } from '@ionic/angular';
import { EMPTY, catchError, of, switchMap, take } from 'rxjs';
import { AddressService } from 'src/app/services/address.service';
import { TransportService } from 'src/app/services/transport.service';
import { HourComponent } from './hour/hour.component';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/utils/services/utils.service';

@Component({
  selector: 'app-pick-up',
  templateUrl: './pick-up.page.html',
  styleUrls: ['./pick-up.page.scss'],
})
export class PickUpPage implements OnInit {
  address: Array<any> = [];
  isLoading: boolean = false;
  selectedAccordionPk: any = null;
  date: string;
  hour: string;
  form = this.formBuilder.nonNullable.group({
    date: ['', [Validators.required]],
    hour: ['', [Validators.required]],
    instruction: [''],
  });
  vehicle: any;
  addressSelected:Array<any> = [];
  isReorderDisabled = true;
  constructor(
    private formBuilder: FormBuilder,
    private transportService: TransportService,
    private addressService: AddressService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private router: Router,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {
    this.vehicle = this.transportService.vehicle;
    if(!this.vehicle) {
      this.router.navigateByUrl('/private/tabs/transports/new-delivery/vehicle-choice')
    }
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.addressService.address
      .pipe(
        take(1),
        switchMap(address => {
          if (address.length > 0) {
            return of(address);
          } else {
            return this.addressService.fetchAddress().pipe(
              catchError(error => {
                console.error('Error fetching address:', error);
                return EMPTY;
              })
            );
          }
        })
      )
      .subscribe(addresses => {
        this.address = addresses;
        this.isLoading = false;

        if (this.transportService.deliveries.length > 0) {
          this.transportService.deliveries.forEach(delivery => {
            const originAddress = delivery.origin.address;
            if (!this.addressSelected.some(selected => selected.pk === originAddress.pk)) {
              this.addressSelected.push(originAddress);
            }
          });
        }

        console.log(this.transportService.deliveries);
        console.log('addressSelected: ', this.addressSelected);
      });
  }

  getCountry(countryCode: string): string {
    return countryCode;
  }

  addressIsSelected(addressPk: any): boolean {
    return this.addressSelected.some(selected => selected.pk === addressPk);
  }

  onSelectedAddress(addressPk: any) {
    this.selectedAccordionPk = addressPk;

    this.addressService.getAddress(addressPk).pipe(take(1)).subscribe((address) => {




      const slotDate = this.date + 'T' + this.hour + 'Z';

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

      // Constructing the vehicle object
      const vehicle = {
        "license_plate": this.vehicle
      };

      // Constructing the delivery object
      const delivery:any = {
        "origin": course,
        //"destination": course,
        "planned_loads": []
      };

      // Adding to the respective arrays
      if (!this.transportService.deliveries) {
        this.transportService.deliveries = [];
      }
      this.transportService.deliveries.push(delivery);

      //When we try to add an origin (so another delivery)
      // if(!this.utilsService.areAllValuesIdentical(this.transportService.deliveries, 'origin', 'address')){
      //   console.log('address non egale');
      //   const firstDestination = this.transportService.deliveries[0].destination;
      //   this.transportService.deliveries.forEach(delivery => {
      //     delivery.destination = firstDestination;
      //   })
      // }
      //console.log(this.transportService.deliveries);
      this.router.navigateByUrl('/private/tabs/transports/new-delivery/merchandise');


   });
  }

  removeSelectedAddress(addressPk: any) {
    this.selectedAccordionPk = null;
    const index = this.addressSelected.findIndex(address => address.pk === addressPk);
    if (index !== -1) {
      const removedAddress = this.addressSelected.splice(index, 1)[0]; // Remove from selected addresses

      // Remove the address from deliveries
      const deliveryIndex = this.transportService.deliveries.findIndex(delivery =>
        delivery.origin.address.pk === addressPk);

      if (deliveryIndex !== -1) {
        this.transportService.deliveries.splice(deliveryIndex, 1);
      }
    }
  }

  async openDatePicker(type: string) {
    const modal = await this.modalController.create({
      component: HourComponent,
      componentProps: {
        type: type,
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
        this.form.controls['date'].setValue(formatedDate);
      } else {
        const hour = format(new Date(data), "HH:mm:ss");
        this.hour = hour;
        this.form.controls['hour'].setValue(hour);
      }
    }
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

  toggleReorder() {
    this.isReorderDisabled = !this.isReorderDisabled;
  }
}
