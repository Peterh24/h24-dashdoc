import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { EMPTY, catchError, of, switchMap, take } from 'rxjs';
import { AddressService } from 'src/app/services/address.service';
import { TransportService } from 'src/app/services/transport.service';
import { HourComponent } from './hour/hour.component';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Router } from '@angular/router';

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
  constructor(
    private formBuilder: FormBuilder,
    private transportService: TransportService,
    private addressService: AddressService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private router: Router,
  ) { }

  ngOnInit() {
    this.vehicle = this.transportService.vehicle;
    if(!this.vehicle) {
      this.router.navigateByUrl('/private/tabs/transports/new-delivery/vehicle-choice')
    }
  }

  ionViewWillEnter(){
    this.isLoading = true;
    this.addressService.address.pipe(
      take(1),
      switchMap(address => {
        if(address.length > 0) {
          return of(address);
        } else {
          return this.addressService.fetchAddress().pipe(
            catchError(error => {
              console.error('Error fetching address:', error)
              return EMPTY;
            })
          )
        }
      }),
      ).subscribe(address => {
        this.address = address;
        this.isLoading = false;
      });
  }

  getCountry(countryCode: string): string {
    return countryCode;
  }

  onSelectedAddress(addressPk: any) {
    this.selectedAccordionPk = addressPk;
    this.addressService.getAddress(addressPk).pipe(take(1)).subscribe((address) => {
      const slotDate = this.date + 'T' + this.hour + 'Z';

      // Constructing the origin object
      const origin = {
        "address": {
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

      // Constructing the trailer object
      const trailer = {
        "license_plate": this.vehicle
      };

      // Constructing the delivery object
      const delivery = {
        "origin": origin
      };

      // Constructing the segment object
      const segment = {
        "origin": origin,
        "vehicle": vehicle,
        "trailers": [trailer]
      };

      // Adding to the respective arrays
      if (!this.transportService.deliveries) {
        this.transportService.deliveries = [];
      }
      this.transportService.deliveries.push(delivery);

      if (!this.transportService.segments) {
        this.transportService.segments = [];
      }
      this.transportService.segments.push(segment);

      this.router.navigateByUrl('/private/tabs/transports/new-delivery/merchandise');


    });
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
}
