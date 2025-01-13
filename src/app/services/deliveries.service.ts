import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, expand, map, reduce, take, tap } from 'rxjs';
import { Deliveries, Delivery } from '../private/deliveries/delivery.model';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { API_URL, DASHDOC_API_URL } from './constants';
import { Request } from '../private/models/request.model';
import { compareAsc, format, parseISO } from 'date-fns';
import { CountriesService } from '../utils/services/countries.service';
import { ApiTransportService } from './api-transport.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveriesService {
  private _deliveries = new BehaviorSubject<Array<Delivery>>([]);
  private filtreSubject = new BehaviorSubject<string>('all');
  filtre$ = this.filtreSubject.asObservable();
  get deliveries() {
    return this._deliveries.asObservable();
  }
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private countriesService: CountriesService,
    private apiTransport: ApiTransportService
  ) { }

  setFiltre(valeur: string) {
    this.filtreSubject.next(valeur);
  }
  
  fetchDeliveries(status: string = null) {
    return this.apiTransport.getTransports (status).pipe(
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
    this.apiTransport.resetTransports ();
  }

  getMoneticoPaymentRequest (params: any) {
    return this.http.get(`${API_URL}../monetico/request`, { params });
  }
}
