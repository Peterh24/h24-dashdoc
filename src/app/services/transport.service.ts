import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { Address, Contact, Delivery, Load, Message, Site, Transport } from '../private/models/transport.model';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { API_URL, CURRENT_COMPANY, TRANSPORTS_DRAFTS_KEY } from './constants';
import { ApiTransportService } from './api-transport.service';
import { FileUtils } from '../utils/file-utils';
import { TransportOrderService } from './transport-order.service';
import { UtilsService } from '../utils/services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  transports: Transport[] = [];

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private apiTransport: ApiTransportService,
    private transportOrderService: TransportOrderService,
    private utilsService: UtilsService
  ) { }

  fetchTransports(status: string = null) {
    return this.apiTransport.getTransports (status).pipe(
      map ((res: any[]) => res.map ((transport) => this.loadTransport (transport))),
      tap ((transports: Transport[]) => {
        this.transports = transports;
      })
    )
  }

  getTransport(id: string){
    return this.transports.find ((transport) => transport.id == id);
  }

  createTransportMessage (transport: Transport, url: string, file: any) {
    this.apiTransport.createTransportMessage (transport, file).subscribe ({
      next: (res: any) => {
        transport.messages.push (new Message(
          res.document,
          res.created,
        ))
      }
    });
  }

  resetTransports() {
    this.transports = [];
    this.apiTransport.resetTransports ();
  }

  getMoneticoPaymentRequest (params: any) {
    return this.http.get(`${API_URL}../monetico/request`, { params });
  }

  /**
   * Chargement d'un transport
   *
   * Replace origin par null si identique à origin précedante
   * Replace destination par null si identique à destination suivante
   *
   * @param transport
   * @returns Transport
   */
  loadTransport(transport: any) {
    const isSingleOrigin = this.utilsService.areAllValuesIdentical(transport, 'origin', 'address');
    const isSingleDestination = this.utilsService.areAllValuesIdentical(transport, 'destination', 'address');

    const isMultipoint = transport.isMultipoint || !isSingleOrigin && !isSingleDestination;

    const deliveries = this.sortDeliveries(this.loadDeliveries(transport.deliveries, isMultipoint));

    const newTransport = new Transport(
        String(transport.id),
        'audiovisual',
        transport.created_at,
        transport.shipper_reference,
        transport.transport_status,
        transport.global_status,
        [],
        transport.pricing_total_price,
        transport.quotation_total_price,
        deliveries,
        this.loadSegments (transport.segments),
        transport.messages,
        transport.documents,
        transport.license_plate,
        transport.requested_vehicle || transport.vehicle,
        transport.carbon_footprint
    );

    newTransport.isMultipoint = isMultipoint;

    return newTransport;
  }

  loadDeliveries(json: any, isMultipoint = false) {
    const deliveries: Delivery[] = json.map((d: any) => this.loadDelivery(d));

    const isSingleOrigin = this.utilsService.areAllValuesIdentical(json, 'origin', 'address');
    const isSingleDestination = this.utilsService.areAllValuesIdentical(json, 'destination', 'address');

    if (isMultipoint || !isSingleOrigin && !isSingleDestination) {
        // Multipoint
    } else if (isSingleOrigin) {
        const origin = { ...deliveries[0] };
        deliveries.forEach((d, index) => {
            delete d.origin;
        });
        delete origin.destination;
        deliveries.unshift(origin);
    } else {
        const destination = { ...deliveries[deliveries.length - 1] };
        deliveries.forEach((d, index) => {
            delete d.destination;
        });
        delete destination.origin;
        deliveries.push(destination);
    }

    return deliveries;
  }

  loadDelivery(json: any) {
    let origin = null;
    let destination = null;
    let planned_loads = null;

    if (json.origin) {
        origin = new Site(
            json.origin.id,
            this.loadAddress(json.origin?.address),
            json.origin.slots,
            json.origin.instructions,
            json.origin.reference,
            json.origin.handlers,
            json.origin.guarding,
            json.origin.file
        )
    }

    if (json.destination) {
        destination = new Site(
            json.destination.id,
            this.loadAddress(json.destination?.address),
            json.destination.slots,
            json.destination.instructions,
            json.destination.reference,
            json.destination.handlers,
            json.destination.guarding,
            json.destination.file
        )
    }

    const { shipper_reference, shipper_address } = json;

    planned_loads = (json?.planned_loads || json?.loads || []).map((loads: any) => {
        const { id, description, category, complementary_information, quantity, volume, volume_display_unit, weight, linear_meter } = loads;
        return new Load(id, description, category, complementary_information, quantity, volume, volume_display_unit, weight, linear_meter);
    });

    const tracking_contacts = json.tracking_contacts?.map((contact: any) => this.loadContact(contact));

    return new Delivery (json.id, origin, destination, planned_loads, tracking_contacts, shipper_reference, shipper_address )
  }

  loadAddress(json: any) {
      if (!json) {
          return null;
      }

      const { id, name, address, city, postcode, country, instructions, latitude, longitude } = json;
      return new Address (id, name, address, postcode, city, country, instructions, latitude, longitude);
  }

  loadContact(json: any) {
      if (json?.contact) {
          json = json.contact;
      }

      if (!json) {
        return null;
      }

      const { id, first_name, last_name, email, phone_number } = json;

      let companyId, companyName;

      if (typeof json.company === 'object') {
        companyId = json.company?.id;
        companyName = json.company?.name;
      } else {
        companyId = json.company;
        companyName = json.company_name;
      }

      return new Contact (id, companyId, companyName, first_name, last_name, email, phone_number);
  }

  loadSegments(deliveriesJson: any, isMultipoint = false) {
      const segments: Delivery[] = deliveriesJson?.map((d: any) => this.loadDelivery(d));

      segments.forEach((segment, index) => {
          if (index > 0) {
              if (segment.origin?.id === segments[index - 1].destination?.id) {
                  delete segment.origin;
              }
          }
      });

      return segments;
  }

  sortDeliveries (deliveries: any) {
    const isSingleOrigin = this.utilsService.areAllValuesIdentical(deliveries, 'origin', 'address');
    const isSingleDestination = this.utilsService.areAllValuesIdentical(deliveries, 'destination', 'address');

    if (!isSingleOrigin && !isSingleDestination || !isSingleOrigin) {
      return deliveries.sort ((a: any, b: any) =>
        new Date(a.origin?.slots?.[0]?.start).valueOf () - new Date(b.origin?.slots?.[0]?.start).valueOf ()
      )
    } else {
      return deliveries.sort ((a: any, b: any) =>
        new Date(a.destination?.slots?.[0]?.start).valueOf () - new Date(b.destination?.slots?.[0]?.start).valueOf ()
      )
    }
  }

  /**
   * Création d'un transport
   *
   * Créee les segments correspondant au transport
   * Rempli delivery.origin si null
   * Rempli delivery.destination si null
   *
   * @param transport
   * @param shipperReference
   * @returns
   */
  async buildTransport (transport: TransportOrderService, shipperReference: string = null) {
    /* TODO
    if (!transport.trailers?.length) {
      transport.trailers.push({
        "licensePlate": transport.vehicle
      });
    }
    */

    const company = await this.storage.get(CURRENT_COMPANY);

    const deliveries = this.buildDeliveries (transport, company, shipperReference);
    const segments = this.buildSegments (transport, deliveries);

    let dataToApi: any = {
      requested_vehicle: transport.vehicle,
      deliveries: deliveries,
      segments: segments,
    };

    console.log(dataToApi);

    return dataToApi;
  }

  buildDeliveries (transport: TransportOrderService, company: string, shipperReference: string) {
    let deliveries: any[] = [];

    if (transport.isMultipoint) {
      transport.deliveries.forEach ((delivery: any) => {
        deliveries.push ({ ...delivery });
      });
    } else {
      const origins = transport.getOrigins ();
      const destinations = transport.getDestinations ();

      if (destinations.length > 1) {
        // Single origin
        destinations.forEach ((d: any) => {
          delete d.origin;
          delete d.planned_loads; // TODO
          deliveries.push ({
            ...origins[0],
            ...d
          })
        });
      } else {
        // Single destination
        origins.forEach ((o: any) => {
          delete o.destination;
          deliveries.push ({
            ...destinations[0],
            ...o
          })
        });
      }
    }

    deliveries.forEach((delivery: any) => {
      delivery.shipper_reference = shipperReference;
      delivery.shipper_address = {
        company: {
          id: company
        },
      };
    });

    return deliveries;
  }

  buildSegments (transport: TransportOrderService, deliveries: Delivery[]) {
    const segments: any[] = [];

    if (transport.isMultipoint) {
      deliveries.forEach ((d, index) => {
        if (index > 0) {
          const previous = deliveries[index - 1];
          const segment = {
            origin: {...previous.destination},
            destination: {...d.origin}
          }

          segments.push (segment);
        }

        const segment = {...d};
        delete segment.planned_loads;
        delete segment.tracking_contacts;
        segments.push (segment);
      })
    } else {
      if (transport.getDestinations ().length > 1) {
        // Single origin
        const segment = { ...deliveries[0] };
        delete segment.planned_loads;
        delete segment.tracking_contacts;
        segments.push (segment);
        deliveries.forEach ((d, index) => {
          if (index > 0) {
            const segment = {
              origin: {...deliveries[index - 1].destination},
              destination: {...d.destination},
              trailer: transport.trailers
            };
            segments.push (segment);
          }
        });
      } else {
        // Single destination
        deliveries.forEach ((o, index) => {
          if (index < deliveries.length - 1) {
            const segment = {
              destination: {...deliveries[index + 1].origin},
              origin: {...o.origin},
              trailer: transport.trailers
            };
            segments.push (segment);
          }
        });
        const segment = { ...deliveries[deliveries.length - 1] };
        delete segment.planned_loads;
        delete segment.tracking_contacts;
        segments.push (segment);
      }
    }

    segments.forEach ((segment) => segment.trailer = transport.trailers);

    return segments;
  }

  async loadDraft (draftName: string, draft: Transport) {
    const fileUtils = new FileUtils ();

    const transport = this.loadTransport (draft);
    console.log ('draft', transport);
    transport.draftName = draftName;

    for (const delivery of transport.deliveries) {
      if (delivery?.origin?.file) {
        delivery.origin.file = await fileUtils.unserializeFile (delivery.origin.file);
      }
      if (delivery?.destination?.file) {
        delivery.destination.file = await fileUtils.unserializeFile (delivery.destination.file);
      }
    }

    this.transportOrderService.loadTransport (transport, draftName);
  }

  async saveDraft (draftName: string, transport: TransportOrderService) {
    const fileUtils = new FileUtils ();

    for (const delivery of transport.deliveries) {
      if (delivery?.origin?.file) {
        delivery.origin.file = await fileUtils.serializeFile (delivery.origin.file);
      }
      if (delivery?.destination?.file) {
        delivery.destination.file = await fileUtils.serializeFile (delivery.destination.file);
      }
    }

    this.storage.get(CURRENT_COMPANY).then ((id) => {
      this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${id}`).then ((drafts) => {
        if (!drafts) {
          drafts = {};
        }
        drafts[draftName] = transport;
        this.storage.set (`${TRANSPORTS_DRAFTS_KEY}_${id}`, drafts);
      })
    });
  }
}
