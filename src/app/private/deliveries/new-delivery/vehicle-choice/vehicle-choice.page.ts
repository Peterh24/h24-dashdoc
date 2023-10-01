import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Vehicle } from '../../vehicle.model';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { map, take, tap } from 'rxjs';
import Swiper from 'swiper';
import { TransportService } from 'src/app/services/transport.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

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
  @ViewChild('swiper') swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  constructor(
    private vehicleService: VehiclesService,
    private transportService: TransportService,
    private router: Router,
    private modalController: ModalController,
  ) {}

  ngOnInit() {
    this.vehicleService.vehicles.pipe(
      take(1),
      tap((vehicles) => {
        console.log('vehicles: ', vehicles);
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
    if(!this.isModal) {
      this.transportService.isEditMode = false;
      this.transportService.deliveries = [];
      this.transportService.segments = [];
      this.transportService.trailers = [];
      this.transportService.vehicle = {};
    }
  }

  onSlideChange(elem: any){
    const currentIndex = elem.srcElement.swiper.realIndex;
    this.currentVehicle = this.vehicles[currentIndex];
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

  onVehicleSelected(licensePlate: string){
    this.transportService.vehicle = licensePlate
    if(this.isModal){
      this.modalController.dismiss(licensePlate);
    } else {
      this.router.navigateByUrl('/private/tabs/transports/new-delivery/pick-up');
    }

  }

}
