import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take, tap } from 'rxjs';
import { Address, Contact, Delivery, Load, Site, Transport } from '../private/models/transport.model';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { API_URL, DASHDOC_COMPANY, TRANSPORTS_DRAFTS_KEY } from './constants';
import { CountriesService } from '../utils/services/countries.service';
import { ApiTransportService } from './api-transport.service';
import { FileUtils } from '../utils/file-utils';
import { TransportOrderService } from './transport-order.service';
import { UtilsService } from '../utils/services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  private _deliveries = new BehaviorSubject<Array<Transport>>([]);
  private filtreSubject = new BehaviorSubject<string>('all');
  filtre$ = this.filtreSubject.asObservable();
  get deliveries() {
    return this._deliveries.asObservable();
  }
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private countriesService: CountriesService,
    private apiTransport: ApiTransportService,
    private transportOrderService: TransportOrderService,
    private utilsService: UtilsService
  ) { }

  fetchDeliveries(status: string = null) {
    return this.apiTransport.getTransports (status).pipe(
      map ((res: any[]) => res.map ((transport) => this.loadTransport (transport))),
      tap ((deliveries: Transport[]) => {
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

    const isMultipoint = transport.is_multipoint || !isSingleOrigin && !isSingleDestination;

    const deliveries = this.sortDeliveries(this.loadDeliveries(transport.deliveries, isMultipoint));

    return new Transport(
        String(transport.uid),
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
  }

  loadDeliveries(json: any, isMultipoint = false) {
    const deliveries: any[] = json.map((d: any) => this.loadDelivery(d));

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

    return new Delivery ('1', origin, destination, planned_loads, tracking_contacts, shipper_reference, shipper_address )
  }

  loadAddress(json: any) {
      if (!json) {
          return null;
      }

      const { id, name, address, city, postcode, country, latitude, longitude } = json;
      return new Address(id, name, address, postcode, city, country, latitude, longitude);
  }

  loadContact(json: any) {
      if (!json?.contact) {
          return null;
      }

      const { id, company, first_name, last_name, email, phone_number } = json.contact;
      return new Contact(id, company, first_name, last_name, email, phone_number);
  }

  loadSegments(deliveriesJson: any, isMultipoint = false) {
      const segments: any[] = deliveriesJson?.map((d: any) => this.loadDelivery(d));

      segments.forEach((segment, index) => {
          if (index > 0) {
              if (segment.origin?.pk === segments[index - 1].destination?.pk) {
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
   * Rempli origin si null pour chaque delivery
   * Rempli destination si null
   *
   * @param transport
   * @param shipperReference
   * @returns
   */
  async buildTransport (transport: any, shipperReference: string = null) {
    if (!transport.trailers?.length) {
      transport.trailers.push({
        "licensePlate": transport.vehicle
      });
    }

    const company = await this.storage.get(DASHDOC_COMPANY);

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

  buildDeliveries (transport: any, company: string, shipperReference: string) {
    let deliveries: any[] = [];

    if (transport.isMultipoint) {
      deliveries = transport.deliveries;
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
          pk: company
        },
      };
    });

    return deliveries;
  }

  buildSegments (transport: any, deliveries: any[]) {
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
        delete segment.segments;
        delete segment.planned_loads;
        delete segment.tracking_contacts;
        segments.push (segment);
      })
    } else {
      if (transport.getDestinations ().length > 1) {
        // Single origin
        const segment = { ...deliveries[0] };
        delete segment.segments;
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
        delete segment.segments;
        delete segment.planned_loads;
        delete segment.tracking_contacts;
        segments.push (segment);
      }
    }

    segments.forEach ((segment) => segment.trailer = transport.trailers);

    return segments;
  }

  async loadDraft (draftName: string, draft: any) {
    const fileUtils = new FileUtils ();

    const transport = this.loadTransport (draft);
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
