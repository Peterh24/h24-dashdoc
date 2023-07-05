import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take } from 'rxjs';
import { Vehicle } from '../private/deliveries/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  private _vehicles = new BehaviorSubject<Array<Vehicle>>([
    new Vehicle('3M3', 'Man', '3m3', 6.8, 4, 2.6, 3.8, 500, 80),
    new Vehicle('8M3', 'Man', '8m3', 6.8, 4, 2.6, 3.8, 500, 80),
    new Vehicle('14M3', 'Man', '14m3', 6.8, 4, 2.6, 3.8, 500, 80),
    new Vehicle('12M3HAYON', 'Man', '14m3', 6.8, 4, 2.6, 3.8, 500, 80),
    new Vehicle('20M3', 'Man', '20m3', 6.8, 4, 2.6, 3.8, 500, 80),
    new Vehicle('20M3HAYON', 'Man', '20m3', 6.8, 4, 2.6, 3.8, 500, 80)
  ])

  get vehicles() {
    return this._vehicles.asObservable();
  }

  constructor() { }

  getVehicle(id: string) {
    return this.vehicles.pipe(
      take(1),
      map(vehicles => {
        return {...vehicles.find(v => v.license_plate === id)}
      })
    )
  }

}
