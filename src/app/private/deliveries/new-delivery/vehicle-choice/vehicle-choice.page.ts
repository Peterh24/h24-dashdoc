import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Vehicle } from '../../vehicle.model';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { map, take } from 'rxjs';
import Swiper from 'swiper';
import { TransportService } from 'src/app/services/transport.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicle-choice',
  templateUrl: './vehicle-choice.page.html',
  styleUrls: ['./vehicle-choice.page.scss'],
})
export class VehicleChoicePage implements OnInit {
  vehicles: Array<Vehicle>;
  currentVehicle: Vehicle;
  @ViewChild('swiper') swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  isEditMode = false;
  constructor(
    private vehicleService: VehiclesService,
    private transportService: TransportService,
    private router: Router
  ) {}

  ngOnInit() {
    this.vehicleService.vehicles.pipe(
      take(1),
      map(vehicles => {
        this.vehicles = vehicles;
        if (!this.currentVehicle) {
          this.currentVehicle = this.vehicles[0];
        }
      })
    ).subscribe();
  }

  ionViewWillEnter() {
    this.transportService.deliveries = [];
    this.transportService.segments = [];
    this.transportService.trailers = [];
    this.transportService.vehicle = {};
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

  onVehicleSelected(licensePlate: string){
    this.transportService.vehicle = licensePlate
    this.router.navigateByUrl('/private/tabs/transports/new-delivery/pick-up');
  }

}
