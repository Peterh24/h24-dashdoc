import { Injectable } from '@angular/core';
import { map, take, tap } from 'rxjs';
import { Vehicle } from '../private/models/vehicle.model';
import { ApiTransportService } from './api-transport.service';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  vehicles: Vehicle[] = [];

  constructor(
    private apiTransport: ApiTransportService
  ) { }

  fetchVehicles () {
    return this.apiTransport.getVehicles().pipe(
      take(1),
      tap((vehicles: Vehicle[]) => {
        this.vehicles = vehicles;
      })
    );
  }

  getVehicle (licensePlate: string) {
    return this.vehicles.find ((vehicle) => vehicle.licensePlate == licensePlate);
  }

}
