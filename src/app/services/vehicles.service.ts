import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take } from 'rxjs';
import { Vehicle } from '../private/deliveries/vehicle.model';
import { API_URL } from './constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  private _vehicles = new BehaviorSubject<Array<Vehicle>>([
    // new Vehicle('3M3', 'Man', '3m3', 6.8, 4, 2.6, 3.8, 500, 80, false),
    // new Vehicle('8M3', 'Man', '8m3', 6.8, 4, 2.6, 3.8, 500, 80, false),
    // new Vehicle('14M3', 'Man', '14m3', 6.8, 4, 2.6, 3.8, 500, 80, false),
    // new Vehicle('14M3HAYON', 'Man', '14m3', 6.8, 4, 2.6, 3.8, 500, 80, true),
    // new Vehicle('20M3', 'Man', '20m3', 6.8, 4, 2.6, 3.8, 500, 80, false),
    // new Vehicle('20M3HAYON', 'Man', '20m3', 6.8, 4, 2.6, 3.8, 500, 80, true)
  ])

  get vehicles() {
    return this._vehicles.asObservable();
  }

  constructor(
    private http: HttpClient,
  ) { }

  fetchVehicles() {
    return this.http.get(`${API_URL}vehicles`).pipe(take(1)).subscribe((res:any) => {
      const data = res['hydra:member'];
      console.log('data ', data);
      this._vehicles.next(data);
      
    })
  }

  getVehicle(id: string) {
    return this.vehicles.pipe(
      take(1),
      map(vehicles => {
        return {...vehicles.find(v => v.licensePlate === id)}
      })
    )
  }

}
