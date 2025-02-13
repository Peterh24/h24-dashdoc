import { Injectable } from '@angular/core';
import { UtilsService } from '../utils/services/utils.service';
import { ApiTransportService } from './api-transport.service';
import { Storage } from '@ionic/storage-angular';
import { DASHDOC_COMPANY, TRANSPORTS_DRAFTS_KEY } from './constants';
import { FileUtils } from '../utils/file-utils';

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

  constructor(
    private storage: Storage,
    private utilsService: UtilsService
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

    const origins = this.getOrigins().length;
    const destinations = this.getDestinations().length;

    this.isMultipoint = this.isMultipoint || origins > 1 && destinations > 1;
  
    console.log ('load', transport);
  }

  loadDeliveries (deliveriesJson: any, isMultipoint = false) {
    const deliveries: any[] = deliveriesJson.map ((d: any) => this.loadDelivery (d));

    const isSingleOrigin = this.utilsService.areAllValuesIdentical(deliveriesJson, 'origin', 'address');
    const isSingleDestination = this.utilsService.areAllValuesIdentical(deliveriesJson, 'destination', 'address');

    if (isMultipoint || !isSingleOrigin && !isSingleDestination) {
      // Multipoint
    } else if (isSingleOrigin) {
      const origin = { ...deliveries[0] };
      deliveries.forEach ((d, index) => {
        delete d.origin;
      });
      delete origin.destination;
      deliveries.unshift (origin);
    } else {
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
        handlers: deliveryJson.origin.handlers,
        guarding: deliveryJson.origin.guarding,
        file: deliveryJson.origin.file
      }
    }

    if (deliveryJson.destination) {
      destination = { 
        address: this.loadAddress (deliveryJson.destination?.address), 
        instructions: deliveryJson.destination.instructions, 
        slots: deliveryJson.destination.slots,
        reference: deliveryJson.destination.reference,
        handlers: deliveryJson.destination.handlers,
        guarding: deliveryJson.destination.guarding,
        file: deliveryJson.destination.file
      }
    }

    const { shipper_reference, shipper_address } = deliveryJson;

    planned_loads = (deliveryJson?.planned_loads || deliveryJson?.loads || []).map ((loads: any) => {
      const { id, description, quantity, category, complementary_information } = loads;
      return { id, description, quantity, category, complementary_information };
    });

    const tracking_contacts = deliveryJson.tracking_contacts?.map ((contact: any) => this.loadContact (contact));

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

  loadSegments (deliveriesJson: any, isMultipoint = false) {
    const segments: any[] = deliveriesJson?.map ((d: any) => this.loadDelivery (d));

    segments.forEach ((segment, index) => {
      if (index > 0) {
        if (segment.origin?.pk === segments[index-1].destination?.pk) {
          delete segment.origin;
        }
      }
    });

    return segments;
  }

  async loadDraft (draftName: string, draft: any) {
    const fileUtils = new FileUtils ();

    this.loadTransport (draft);
    this.draftName = draftName;

    for (const delivery of this.deliveries) {
      if (delivery?.origin?.file) {
        delivery.origin.file = await fileUtils.unserializeFile (delivery.origin.file);
      }
      if (delivery?.destination?.file) {
        delivery.destination.file = await fileUtils.unserializeFile (delivery.destination.file);
      }
    }
  }

  async saveDraft (draftName: string, transport: any) {
    const fileUtils = new FileUtils ();

    for (const delivery of transport.deliveries) {
      if (delivery?.origin?.file) {
        delivery.origin.file = await fileUtils.serializeFile (delivery.origin.file);
      }
      if (delivery?.destination?.file) {
        delivery.destination.file = await fileUtils.serializeFile (delivery.destination.file);
      }
    }

    transport.is_multipoint = transport.isMultipoint;

    this.storage.get(DASHDOC_COMPANY).then ((pk) => {
      this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${pk}`).then ((drafts) => {
        if (!drafts) {
          drafts = {};
        }
        drafts[draftName] = transport;
        this.storage.set (`${TRANSPORTS_DRAFTS_KEY}_${pk}`, drafts);
      })
    });
  }
}
