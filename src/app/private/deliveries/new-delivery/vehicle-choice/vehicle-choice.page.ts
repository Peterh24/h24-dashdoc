import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Vehicle } from '../../vehicle.model';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { take } from 'rxjs';
import Swiper from 'swiper';

@Component({
  selector: 'app-vehicle-choice',
  templateUrl: './vehicle-choice.page.html',
  styleUrls: ['./vehicle-choice.page.scss'],
})
export class VehicleChoicePage implements OnInit {
  vehicles: Array<Vehicle>;
  currentVehicle: Vehicle;
  public progress = 0;
  @ViewChild('swiper') swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  intervalRef: any;
  constructor(
    private vehicleService: VehiclesService
  ) { 

    this.intervalRef = setInterval(() => { // Stockez la référence de l'intervalle
      this.progress += 0.01;
      if (this.progress > 0.25) {
        clearInterval(this.intervalRef); // Arrêtez l'intervalle lorsque la condition est remplie
      }
    }, 30);
  }

  ngOnInit() {
    this.vehicleService.vehicles.pipe(take(1)).subscribe(vehicles => {
      this.vehicles = vehicles;
      if(!this.currentVehicle){
        this.currentVehicle = this.vehicles[0];
      }
    })
  }

  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  onSlideChange(elem: any){
    const currentIndex = elem.srcElement.swiper.realIndex;
    this.currentVehicle = this.vehicles[currentIndex];
    console.log(this.currentVehicle);
  }

  goPrev(){
    this.swiperRef.nativeElement.swiper.slidePrev();
  }

  goNext(){
    this.swiperRef.nativeElement.swiper.slideNext();
  }
}
