import { Injectable } from '@angular/core';

interface Transport {
  segments: Array<
  {
    trailers:Array<{
      licensePlate: string
    }
    >,
  }
  >,

}

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  type: string;
  originNb:number = 0;
  vehicle: {};
  trailers: Array<any> = [];
  deliveries: Array<any> = [];
  segments: Array<any> = [];
  transport: any = {};
  minDateOrigin: string;
  minHourOrigin: string;
  minDateDestination: string;
  minHourDestination: string;
  isEditMode = false;
  isMultipoint = false;
  draftName: string;

  constructor() { } 

  getOrigins () {
    return this.deliveries?.filter ((d) => d?.origin);
  }
  
  getDestinations () {
    return this.deliveries?.filter ((d) => d?.destination);
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

  resetTransport () {
    this.isMultipoint = false;
    this.isEditMode = false;
    this.draftName = null;
    this.deliveries = [];
    this.segments = [];
    this.trailers = [];
    this.vehicle = {};
  }
  
  loadTransport (transport: any) {
    this.resetTransport ();

    this.type = 'audiovisual';
    this.vehicle = transport.requested_vehicle;
    this.deliveries = this.loadDeliveries (transport.deliveries);
    this.isMultipoint = this.getOrigins().length > 1 && this.getDestinations ().length > 1;

    console.log ('load', transport, this);
  }

  loadDeliveries (deliveriesJson: any) {
    let sameAddress = (a: any, b: any) => 
        a.address?.address == b.address?.address && 
        a.address?.postcode == b.address?.postcode;

    for (let i = 0; i < deliveriesJson.length; i++) {
        const deliveryJson = deliveriesJson[i];

        if (i > 0 && sameAddress(deliveryJson.origin, deliveriesJson[i - 1].origin)) {
          delete deliveryJson.origin;
        }

        if (i < deliveriesJson.length - 1 && sameAddress(deliveryJson.destination, deliveriesJson[i + 1].destination)) {
          delete deliveriesJson.destination;
        }
    }

    return deliveriesJson;
  }
}
