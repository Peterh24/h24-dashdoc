import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take, tap } from 'rxjs';
import { Vehicle } from '../private/deliveries/vehicle.model';
import { API_URL } from './constants';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

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
    private authService: AuthService
  ) { }

  fetchVehicles() {
    return this.http.get(`${API_URL}vehicles`).pipe(
      take(1),
      map((res: any) => res['hydra:member']),
      tap((data: Vehicle[]) => {
        this.authService.SetUserInfo();
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
