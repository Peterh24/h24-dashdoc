import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take, tap } from 'rxjs';
import { Vehicle } from '../private/deliveries/vehicle.model';
import { API_URL } from './constants';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { ApiTransportService } from './api-transport.service';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  private _vehicles = new BehaviorSubject<Array<Vehicle>>([]);

  get vehicles() {
    return this._vehicles.asObservable();
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private apiTransport: ApiTransportService
  ) { }

  fetchVehicles() {
    return this.apiTransport.getVehicles().pipe(
      take(1),
      tap((data: Vehicle[]) => {
//        this.authService.SetUserInfo(); // TODO @deprecated
        this._vehicles.next(data);
      })
    );
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
