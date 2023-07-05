import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, expand, map, reduce, tap } from 'rxjs';
import { Delivery } from '../private/deliveries/delivery.model';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL } from './constants';
import { Request } from '../private/models/request.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveriesService {
  private _deliveries = new BehaviorSubject<Array<Delivery>>([]);

  get deliveries() {
    return this._deliveries.asObservable();
  }
  constructor(
    private http: HttpClient,
    private storage: Storage,
  ) { }

  fetchDeliveries() {
    return this.http.get(`${DASHDOC_API_URL}transports/`).pipe(
      expand((resData: Request) => {
        if (resData.next !== null) {
          return this.http.get(resData.next);
        } else {
          return EMPTY;
        }
      }),
      map((resData: Request) => {
          const deliveries: Array<Delivery> = resData.results.map((data:any) => {
          // Parse deliveries array for get needed data
          const deliveriesData = data.deliveries.map((delivery: any) => {
            const { uid, origin, destination } = delivery;
            return { uid, origin, destination };
          });

          // check if data.segments[0].trailers[0] is defined
          const licensePlate = data.segments[0].trailers[0] ? data.segments[0].trailers[0].license_plate : '';
          return new Delivery(
            data.uid,
            data.deliveries[0].shipper_reference,
            data.global_status,
            data.pricing_total_price,
            deliveriesData,
            licensePlate,
            data.created,
          )
        });
        return deliveries;
      }),
      reduce((deliveries: Delivery[], results: Delivery[]) => deliveries.concat(results), []),
      tap((deliveries: Delivery[]) => {
        console.log('deliveries: ', deliveries);
        this._deliveries.next(deliveries);
      })
    )
  }
}
