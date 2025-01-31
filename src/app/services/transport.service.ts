import { Injectable } from '@angular/core';
import { UtilsService } from '../utils/services/utils.service';
import { ApiTransportService } from './api-transport.service';

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
  uid: string;
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
  isMultipoint: any = null;
  draftName: string;

  constructor(private utilsService: UtilsService) { }

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
    this.type = null;
    this.isMultipoint = null;
    this.isEditMode = false;
    this.draftName = null;
    this.deliveries = [];
    this.segments = [];
    this.trailers = [];
    this.vehicle = null;
  }

  loadTransport (transport: any) {
    this.resetTransport ();

    this.uid = transport.uid;
    this.type = 'audiovisual';
    this.vehicle = transport.requested_vehicle;
    this.isMultipoint = transport.is_multipoint;
    this.deliveries = this.loadDeliveries (transport.deliveries, this.isMultipoint);

    this.sortDeliveries ();

    console.log ('load', transport, this);
  }

  loadDeliveries (deliveriesJson: any, isMultipoint = false) {
    const deliveries: any[] = deliveriesJson.map ((d: any) => this.loadDelivery (d));

    const isSingleOrigin = this.utilsService.areAllValuesIdentical(deliveriesJson, 'origin', 'address');
    const isSingleDestination = this.utilsService.areAllValuesIdentical(deliveriesJson, 'destination', 'address');

    if (isMultipoint || !isSingleOrigin && !isSingleDestination) {
      this.isMultipoint = true;
    } else if (isSingleOrigin) {
      this.isMultipoint = false;
      const origin = { ...deliveries[0] };
      deliveries.forEach ((d, index) => {
        delete d.origin;
      });
      delete origin.destination;
      deliveries.unshift (origin);
    } else {
      this.isMultipoint = false;
      const destination = { ...deliveries[deliveries.length - 1] };
      deliveries.forEach ((d, index) => {
        delete d.destination;
      });
      delete destination.origin;
      deliveries.push (destination);
    }

    return deliveries;
  }

  loadDelivery (deliveryJson: any) {
    let origin = null;
    let destination = null;
    let planned_loads = null;

    if (deliveryJson.origin) {
      origin = { 
        address: this.loadAddress (deliveryJson.origin?.address), 
        instructions: deliveryJson.origin.instructions, 
        slots: deliveryJson.origin.slots,
        reference: deliveryJson.origin.reference,
        handlers: deliveryJson.origin?.handlers
      }
    }

    if (deliveryJson.destination) {
      destination = { 
        address: this.loadAddress (deliveryJson.destination?.address), 
        instructions: deliveryJson.destination.instructions, 
        slots: deliveryJson.destination.slots,
        reference: deliveryJson.destination.reference,
        handlers: deliveryJson.destination?.handlers
      }
    }

    const { shipper_reference, shipper_address } = deliveryJson;

    planned_loads = (deliveryJson?.planned_loads || deliveryJson?.loads || []).map ((loads: any) => {
      const { id, description, quantity, category, complementary_information } = loads;
      return { id, description, quantity, category, complementary_information };
    });

    const tracking_contacts = deliveryJson.tracking_contacts?.map ((contact: any) => this.loadContact (contact));

    // TODO on oublie rien ?
    return { origin, destination, planned_loads, shipper_reference, shipper_address, tracking_contacts }
  }

  loadAddress (addressJson: any) {
    if (!addressJson) {
      return {};
    }
    
    const { pk, name, address, city, postcode, country, latitude, longitude } = addressJson;
    return { pk, name, address, city, postcode, country, latitude, longitude };
  }

  loadContact (contactJson: any) {
    if (!contactJson?.contact) {
      return null;
    }

    const { id, company, first_name, last_name, email, phone_number } = contactJson.contact;
    return { contact: { company: { pk: company?.pk }, id, first_name, last_name, email, phone_number } };
  }
}
