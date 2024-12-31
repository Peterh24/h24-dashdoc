import { Component, ElementRef, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { Vehicle } from '../../vehicle.model';
import Swiper from 'swiper';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { TransportService } from 'src/app/services/transport.service';
import { ModalController } from '@ionic/angular';
import { take, tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicle-choice',
  templateUrl: './vehicle-choice.page.html',
  styleUrls: ['./vehicle-choice.page.scss'],
})
export class VehicleChoicePage implements OnInit {

  @Input()isModal: boolean;
  @Input()dataToEdit: any;
  vehicles: Array<Vehicle>;
  currentVehicle: Vehicle;
  currentIndex: number = 0;
  @ViewChild('swiper') swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  constructor(
    private vehicleService: VehiclesService,
    private transportService: TransportService,
    private router: Router,
    private modalController: ModalController,
    private _ngZone: NgZone
  ) {}

  ngOnInit() {
    this.vehicleService.vehicles.pipe(
      take(1),
      tap((vehicles) => {
        if (vehicles.length > 0) {
          this.vehicles = vehicles;
          if (!this.currentVehicle) {
            this.currentVehicle = this.vehicles[0];
          }
        } else {
          this.vehicleService.fetchVehicles().subscribe((vehicles) => {
            this.vehicles = vehicles;
            if (!this.currentVehicle && vehicles.length > 0) {
              this.currentVehicle = vehicles[0];
            }
          });
        }
      })
    ).subscribe();
  }

  ionViewDidEnter() {
    /*
    if(!this.isModal) {
      this.transportService.isMultipoint = false;
      this.transportService.isEditMode = false;
      this.transportService.deliveries = [];
      this.transportService.segments = [];
      this.transportService.trailers = [];
      this.transportService.vehicle = {};
    }
    */
  }

  onSlideChange(elem: any){
    this.currentIndex = elem.srcElement.swiper.realIndex;
    this.currentVehicle = this.vehicles[this.currentIndex];
  }

  goPrev(){
    this.swiperRef.nativeElement.swiper.slidePrev();
  }

  goNext(){
    this.swiperRef.nativeElement.swiper.slideNext();
  }

  cancel(){
    this.modalController.dismiss();
  }

  onSwitchVehicle (vehicle: any) {
    this.currentIndex = this.vehicles.findIndex ((v) => v.licensePlate == vehicle.licensePlate);
    this.currentVehicle = this.vehicles[this.currentIndex];
    this.swiperRef.nativeElement.swiper.slideTo (this.currentIndex);
  }

  onVehicleSelected(licensePlate: string){
    this.transportService.vehicle = licensePlate
    if(this.isModal){
      this.modalController.dismiss(licensePlate);
    } else {
      if (this.transportService.deliveries?.length) {
        this.router.navigateByUrl ('/private/tabs/transports/new-order/deliveries');
      } else {
        this.router.navigateByUrl('/private/tabs/transports/new-order/multipoint-choice');
      }
    }

  }

}
