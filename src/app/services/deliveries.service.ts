import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, expand, map, reduce, take, tap } from 'rxjs';
import { Deliveries, Delivery } from '../private/deliveries/delivery.model';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL } from './constants';
import { Request } from '../private/models/request.model';
import { compareAsc, format, parseISO } from 'date-fns';
import { CountriesService } from '../utils/services/countries.service';

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
    private countriesService: CountriesService
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
            const { uid, origin, destination, loads } = delivery;
            return { uid, origin, destination, loads };
          }).sort((delivery1: Deliveries, delivery2: Deliveries) => {

            const dateDiff = compareAsc(new Date(delivery1.origin.real_start), new Date(delivery2.origin.real_start));
            if(dateDiff != 0) {
              return dateDiff;
            }
            return compareAsc(new Date(delivery1.destination.real_end), new Date(delivery2.destination.real_end));
            //return format(new Date(delivery1.origin.real_start), 't') > format(new Date(delivery2.origin.real_start), 't') ? -1 : 1;
          });


          // check if data.segments[0].trailers[0] is defined
          const licensePlate = data.segments[0].trailers[0] ? data.segments[0].trailers[0].license_plate : '';
          return new Delivery(
            data.uid,
            data.deliveries[0].shipper_reference,
            data.global_status,
            data.pricing_total_price,
            deliveriesData,
            data.messages,
            data.documents,
            licensePlate
          )
        });


        return deliveries;
      }),
      reduce((deliveries: Delivery[], results: Delivery[]) => deliveries.concat(results), []),
      tap((deliveries: Delivery[]) => {
        this._deliveries.next(deliveries);
      })
    )
  }

  getDelivery(id: any){
    return this.deliveries.pipe(
      take(1),
      map(delivery => {
        return delivery.find(d => d.uid === id);
      })
    );
  }

  getDatePostcode(delivery: Array<any>, source:string){
    let data;

    if (source === 'origin') {
      const startDate = new Date(delivery[0].origin.slots[0].start);
      const formattedStartDate = format(startDate, 'dd-MM-yyyy');
      data = `${formattedStartDate} - ${delivery[0].origin.address.postcode}`;
    } else if (source === 'destination') {
      const endDate = new Date(delivery[delivery.length - 1].destination.slots[0].end);
      const formattedEndDate = format(endDate, 'dd-MM-yyyy');
      data = `${formattedEndDate} - ${delivery[delivery.length - 1].destination.address.postcode}`;
    }

    return data;
  }

  getAddress(delivery: Array<any>, source:string){
    let objectSource;

    if (source === 'origin') {
      objectSource = delivery[0][source].address;
    } else if (source === 'destination') {
      objectSource = delivery[delivery.length -1][source].address;
    }

    return objectSource.address +', '+ objectSource.postcode +' '+ objectSource.city +' '+ this.countriesService.getCountry(objectSource.country);
  }
}
