import { Component, ElementRef, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { Vehicle } from '../../../models/vehicle.model';
import Swiper from 'swiper';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { ModalController } from '@ionic/angular';
import { take, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { TransportOrderService } from 'src/app/services/transport-order.service';

@Component({
  selector: 'app-vehicle-choice-component',
  templateUrl: './vehicle-choice.component.html',
  styleUrls: ['./vehicle-choice.component.scss'],
})
export class VehicleChoiceComponent  implements OnInit {


  @Input()isModal: boolean;
  @Input()dataToEdit: any;
  vehicles: Array<Vehicle>;
  currentVehicle: Vehicle;
  currentIndex: number = 0;
  @ViewChild('swiper') swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  constructor(
    private vehicleService: VehiclesService,
    private transportOrderService: TransportOrderService,
    private router: Router,
    private modalController: ModalController,
    private _ngZone: NgZone,
    public config: ConfigService
  ) {}

  ngOnInit() {
    this.vehicleService.fetchVehicles().pipe(
      take (1),
      tap ((vehicles) => {
        this.vehicles = vehicles;
        if (!this.currentVehicle) {
          this.currentVehicle = this.vehicles[0];
        }
      })
    ).subscribe();
  }

  onSlideChange(elem: any){
    this.currentIndex = elem.srcElement.swiper.realIndex;
    this.currentVehicle = this.vehicles[this.currentIndex];
    this.transportOrderService.vehicle = null;
  }

  goPrev(){
    this.swiperRef.nativeElement.swiper.slidePrev();
    this.transportOrderService.vehicle = null;
  }

  goNext(){
    this.swiperRef.nativeElement.swiper.slideNext();
    this.transportOrderService.vehicle = null;
  }

  cancel(){
    this.modalController.dismiss();
  }

  onSwitchVehicle (vehicle: any) {
    this.currentIndex = this.vehicles.findIndex ((v) => v.licensePlate == vehicle.licensePlate);
    this.currentVehicle = this.vehicles[this.currentIndex];
    this.swiperRef.nativeElement.swiper.slideTo (this.currentIndex);
    this.transportOrderService.vehicle = null;
  }

  onVehicleSelected(licensePlate: string){
    this.transportOrderService.vehicle = licensePlate
    if(this.isModal){
      this.modalController.dismiss(licensePlate);
    } else {
      if (this.config.isMobile) {
        if (this.transportOrderService.deliveries?.length) {
          this.router.navigateByUrl ('/private/tabs/transports/new-order/deliveries');
        } else {
          this.router.navigateByUrl('/private/tabs/transports/new-order/multipoint-choice');
        }
      }
    }
  }
}
