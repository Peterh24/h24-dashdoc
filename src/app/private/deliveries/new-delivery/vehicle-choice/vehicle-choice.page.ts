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
  public progress = 0;
  @ViewChild('swiper') swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  intervalRef: any;
  isEditMode = false;
  constructor(
    private vehicleService: VehiclesService,
    private transportService: TransportService,
    private router: Router
  ) {

    this.intervalRef = setInterval(() => { // Stockez la référence de l'intervalle
      this.progress += 0.01;
      if (this.progress > 0.25) {
        clearInterval(this.intervalRef); // Arrêtez l'intervalle lorsque la condition est remplie
      }
    }, 30);
  }

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

  onVehicleSelected(licensePlate: string){
    const trailers = [{ license_plate: licensePlate }];

    this.transportService.transport.segments.length > 0 ? this.handleEditMode(licensePlate) : this.handleCreateMode(trailers);

    this.router.navigateByUrl('/private/tabs/transports/new-delivery/pick-up');
  }

  private handleEditMode(licensePlate: string) {
    this.isEditMode = true;

    // Exclude segment without trailers
    const segmentsWithTrailers = this.transportService.transport.segments.filter(
      segment => segment.trailers.length > 0
    );

    segmentsWithTrailers.forEach(segment => {
      segment.trailers.forEach(trailer => {
        trailer.license_plate = licensePlate;
      });
    });
  }

  private handleCreateMode(trailers: any[]) {
    this.transportService.transport.segments.push({ trailers });
  }



}
