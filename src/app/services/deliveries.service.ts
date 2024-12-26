import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, expand, map, reduce, take, tap } from 'rxjs';
import { Deliveries, Delivery } from '../private/deliveries/delivery.model';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { API_URL, DASHDOC_API_URL } from './constants';
import { Request } from '../private/models/request.model';
import { compareAsc, format, parseISO } from 'date-fns';
import { CountriesService } from '../utils/services/countries.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveriesService {
  private _deliveries = new BehaviorSubject<Array<Delivery>>([]);
  private next:string = null;
  private url:string = null;
  isLastPageReached = false;
  private filtreSubject = new BehaviorSubject<string>('all');
  filtre$ = this.filtreSubject.asObservable();
  get deliveries() {
    return this._deliveries.asObservable();
  }
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private countriesService: CountriesService
  ) { }

  setFiltre(valeur: string) {
    this.filtreSubject.next(valeur);
  }
  
  fetchDeliveries(status: string = null) {
    if (this.isLastPageReached) {
      return EMPTY; 
    }
    this.url = this.next ? this.next : `${DASHDOC_API_URL}transports/` + (status ? '?status__in=' + status : '');
    return this.http.get(this.url).pipe(
      tap((resData: any) => {
        this.next = resData.next;
      }),
      map((resData: Request) => {
        const data = resData;
        this.next = resData.next;
        const deliveries: Array<Delivery> = data.results.map((data:any)=> {
          const deliveriesData = data.deliveries.map((delivery: any)=> {
            const { uid, origin, destination, loads } = delivery;
            return { uid, origin, destination, loads };
          }).sort((delivery1: Deliveries, delivery2: Deliveries) => {
            const dateDiff = compareAsc(new Date(delivery1.origin.real_start), new Date(delivery2.origin.real_start));
            if(dateDiff != 0) {
              return dateDiff;
            }
            return compareAsc(new Date(delivery1.destination.real_end), new Date(delivery2.destination.real_end));
          })
          


          const licensePlate = data.segments[0].trailers[0] ? data.segments[0].trailers[0].license_plate : '';


          return new Delivery(
            data.uid,
            data.created,
            data.deliveries[0].shipper_reference,
            data.status,
            data.global_status,
            data.status_updates?.[data.status_updates?.length - 1]?.category,
            data.pricing_total_price,
            data.quotation_total_price,
            deliveriesData,
            data.messages,
            data.documents,
            licensePlate,
            data.requested_vehicle, 
            data.carbon_footprint
          )
        });

              // Mettez à jour l'état de la pagination
      if (resData.next === null) {
        this.isLastPageReached = true;
      }
        
        return deliveries;
      }),
      reduce((deliveries: Delivery[], results: Delivery[]) => deliveries.concat(results), []),
      tap((deliveries: Delivery[]) => {
        this._deliveries.next([...this._deliveries.value, ...deliveries]);
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

  getDatePostcode(delivery: Array<any>, source: string) {
    let data;

    if (source === 'origin') {
      if (delivery[0]?.origin?.slots?.[0]?.start) {
        const startDate = new Date(delivery[0].origin.slots[0].start);
        const formattedStartDate = format(startDate, 'dd-MM-yyyy');
        data = `${formattedStartDate} - ${delivery[0].origin.address.postcode}`;
      }
    } else if (source === 'destination') {
      if (delivery[delivery.length - 1].destination?.slots?.[0]?.end) {
        const endDate = new Date(delivery[delivery.length - 1].destination.slots?.[0]?.end);
        const formattedEndDate = format(endDate, 'dd-MM-yyyy');
        data = `${formattedEndDate} - ${delivery[delivery.length - 1].destination.address.postcode}`;
      }
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

    if (!objectSource) {
      return null;
    }
    
    return objectSource.address +', '+ objectSource.postcode +' '+ objectSource.city +' '+ this.countriesService.getCountry(objectSource.country);
  }

  resetDeliveries() {
    this._deliveries.next([]);
    this.next = null;
    this.isLastPageReached = false;
  }

  getMoneticoPaymentRequest (params: any) {
    return this.http.get(`${API_URL}../monetico/request`, { params });
  }
}
