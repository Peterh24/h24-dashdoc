import { Injectable } from '@angular/core';
import { Transport } from '../private/models/transport.model';

@Injectable({
  providedIn: 'root'
})
export class TransportOrderService {
  id: string;
  type: string;
  vehicle: string;
  trailers: Array<any> = [];
  deliveries: Array<any> = [];
  segments: Array<any> = [];
  isMultipoint: boolean = null;
  draftName: string;

  constructor(
  ) { }

  getOrigins () {
    return this.deliveries?.filter ((d) => d?.origin);
  }

  getDestinations () {
    return this.deliveries?.filter ((d) => d?.destination);
  }

  getOrigin () {
    return this.getOrigins()?.[0];
  }

  getDestination () {
    return this.getDestinations ().pop ();
  }

  getAllPlannedLoads () {
    return [...new Set(this.deliveries.map ((d) => d.planned_loads).map ((l) => l.description)) ];
  }

  loadTransport (transport: Transport, draftName: string = null) {
    this.type = transport.type;
    this.draftName = draftName;
    this.deliveries = transport.deliveries;
    this.segments = transport.segments;
    this.trailers = transport.trailers;
    this.vehicle = transport.vehicle;
    this.isMultipoint = transport.isMultipoint || this.getOrigins().length > 1 && this.getDestinations().length > 1;
  }

  resetTransport () {
    this.type = null;
    this.isMultipoint = null;
    this.draftName = null;
    this.deliveries = [];
    this.segments = [];
    this.trailers = [];
    this.vehicle = null;
  }

  sortDeliveries () {
    if (this.isMultipoint || this.getOrigins().length > 1) {
      this.deliveries = this.deliveries.sort ((a, b) =>
        new Date(a.origin?.slots?.[0]?.start).valueOf () - new Date(b.origin?.slots?.[0]?.start).valueOf ()
      )
    } else {
      this.deliveries = this.deliveries.sort ((a, b) =>
        new Date(a.destination?.slots?.[0]?.start).valueOf () - new Date(b.destination?.slots?.[0]?.start).valueOf ()
      )
    }
  }
}
