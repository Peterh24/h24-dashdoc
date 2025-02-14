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

  resetDeliveries() {
    this._deliveries.next([]);
    this.apiTransport.resetTransports ();
  }

  getMoneticoPaymentRequest (params: any) {
    return this.http.get(`${API_URL}../monetico/request`, { params });
  }
}
