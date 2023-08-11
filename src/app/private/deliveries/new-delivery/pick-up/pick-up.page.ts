import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { EMPTY, catchError, of, switchMap, take } from 'rxjs';
import { AddressService } from 'src/app/services/address.service';
import { TransportService } from 'src/app/services/transport.service';
import { HourComponent } from './hour/hour.component';

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
  constructor(
    private formBuilder: FormBuilder,
    private transportService: TransportService,
    private addressService: AddressService,
    private loadingController: LoadingController,
    private modalController: ModalController,
  ) { }

  ngOnInit() {

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

  onSelectedAddress(addressPk: any){
    this.selectedAccordionPk = addressPk;
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
    if(type === 'date') {
      this.date = data;
    } else {
      this.hour = data;
    }

    console.log('date: ', this.date);
    console.log('hour: ', this.hour);
  }
}
