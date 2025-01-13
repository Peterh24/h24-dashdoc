import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject } from "@angular/core";
import { Storage } from "@ionic/storage-angular";
import { DASHDOC_API_URL } from "./constants";
import { EMPTY, expand, map, reduce, tap } from "rxjs";
import { Address } from "../private/profile/address/address.model";
import { Request } from "../private/models/request.model";
import { Deliveries, Delivery } from "../private/deliveries/delivery.model";
import { compareAsc } from "date-fns";
import { Contact } from "../private/profile/contacts/contact.model";

export class ApiTransportDashdoc {
    static model: string = 'dashdoc';
    static isDashdocModel: boolean = true;

    storage = inject (Storage);
    http = inject (HttpClient);

    constructor() { 
    }

    /* Companies */
    getCompanyStatus () {
        return this.http.get(`${DASHDOC_API_URL}transports/?status__in=created,updated,confirmed,declined,verified`);
    }
    
    /* Contacts */
    getContacts () {
        return this.http.get(`${DASHDOC_API_URL}contacts/`).pipe(
            expand ((res: any) => res.next ? this.http.get (res.next) : EMPTY),
            reduce ((acc: any, res: any) => acc.concat (res.results),  []),
            map ((acc: any) => acc.map ((contact: any, index: number) => new Contact (
              contact.uid,
              contact.first_name,
              contact.last_name,
              contact.email,
              contact.phone_number,
              contact.company?.pk,
              contact.company?.name
            ))));
    }

    createContact (contact: any) {
        return this.http.post(`${DASHDOC_API_URL}contacts/`, contact).pipe(
            map ((res: any) => new Contact (res.uid, contact.first_name, contact.last_name, contact.email, contact.phone_number, contact.company?.pk, contact.company_name))
        );
    }

    updateContact (uid: string, contact: any) {
        return this.http.patch(`${DASHDOC_API_URL}contacts/${uid}/`, contact).pipe(
            map ((res: any) => new Contact (uid, contact.first_name, contact.last_name, contact.email, contact.phone_number, contact.company?.pk, contact.company_name))
        )
    }

    deleteContact (uid: string) {
        return this.http.delete(`${DASHDOC_API_URL}contacts/${uid}/`);
    }

    getContactsCompanies () {
        return this.http.get(`${DASHDOC_API_URL}companies/`).pipe(
          expand ((res: any) => res.next ? this.http.get (res.next) : EMPTY),
          reduce ((acc: any, res: any) => acc.concat (res.results),  []),
          map ((acc: any) => acc.map ((company: any) => (
            {
              pk: company.pk,
              name: company.name,
            }
          )))
        );
    }

    /* Addresses */
    getAddresses () {
        return this.http.get(`${DASHDOC_API_URL}addresses/`).pipe(
            expand((resData: Request) => {
              if (resData.next !== null) {
                return this.http.get(resData.next);
              } else {
                return EMPTY;
              }
            }),
            map((resData: Request) => resData.results),
            reduce((address: Address[], results: Address[]) => address.concat(results), []))
    }

    createAddress (address: any) {
        return this.http.post(`${DASHDOC_API_URL}addresses/`, address)
    }

    updateAddress (addressId: any, address: any) {
        return this.http.patch(`${DASHDOC_API_URL}addresses/${addressId}`, address);
    }

    deleteAddress (addressId: any) {
        return this.http.delete(`${DASHDOC_API_URL}addresses/${addressId}/`);
    }

    /* Transports */ 
    isTransportLastPageReached = false;
    nextTransportPage: string;

    createTransport (transport: any) {
        this.toDashdocTransport (transport);
        return this.http.post(`${DASHDOC_API_URL}transports/`, transport);
    }

    updateTransport (transport: any) {
        this.toDashdocTransport (transport);

        const headers = new HttpHeaders()
            .set ('Content-Type', 'application/merge-patch+json');

        return this.http.patch(`${DASHDOC_API_URL}transports/${transport.uid}`, transport, { headers });
    }

    getTransports (status: string = null) {
        if (this.isTransportLastPageReached) {
            return EMPTY; 
        }
        const url = this.nextTransportPage ? this.nextTransportPage : `${DASHDOC_API_URL}transports/` + (status ? '?status__in=' + status : '');

        return this.http.get(url).pipe(
            map((resData: Request) => {
                const data = resData;
                this.nextTransportPage = resData.next;
                if (resData.next === null) {
                    this.isTransportLastPageReached = true;
                }

                return data.results.map ((data:any) => this.loadTransport (data));
            }),
            reduce((deliveries: Delivery[], results: Delivery[]) => deliveries.concat(results), []));
    }

    resetTransports () {
        this.nextTransportPage = null;
        this.isTransportLastPageReached = false;
    }

    loadTransport (data: any) {
        this.fromDashdocTransport (data);

        const deliveriesData = data.deliveries.map((delivery: any) => {
            const { uid, origin, destination, loads, tracking_contacts } = delivery;
            return { uid, origin, destination, loads, tracking_contacts };
        }).sort((delivery1: Deliveries, delivery2: Deliveries) => { // TODO
            const dateDiff = compareAsc(new Date(delivery1.origin.real_start), new Date(delivery2.origin.real_start));
            if(dateDiff != 0) {
                return dateDiff;
            }
            return compareAsc(new Date(delivery1.destination.real_end), new Date(delivery2.destination.real_end));
        })

        const licensePlate = data.segments[0].trailers[0] ? data.segments[0].trailers[0].license_plate : '';

        const statuses: any = {};
        data.status_updates?.forEach ((status: any) => {
            statuses[status.category] = {
            status: status.category,
            created: status.created,
            latitude: status.latitude,
            longitude: status.longitude,
            }
        });

        return new Delivery(
            data.uid,
            data.created,
            data.deliveries[0].shipper_reference,
            data.status,
            data.global_status,
            statuses,
            data.pricing_total_price,
            data.quotation_total_price,
            deliveriesData,
            data.messages,
            data.documents,
            licensePlate,
            data.requested_vehicle,
            data.carbon_footprint
        )
    }

    fromDashdocTransport (transport: any) {
        transport?.deliveries?.forEach ((delivery: any) => {
          if (delivery.origin) {
            delivery.origin.handlers = parseInt(delivery.origin.action || 0);
          }

          if (delivery.destination) {
            delivery.destination.handlers = parseInt(delivery.destination.action || 0);
          }
        });
    }

    toDashdocTransport (transport: any) {
        transport?.deliveries?.forEach ((delivery: any) => {
          if (delivery.origin) {
            delivery.origin.action = String(delivery.origin.handlers || 0);
            delete delivery.origin.handlers;
          }
          if (delivery.destination) {
            delivery.destination.action = String(delivery.destination.handlers || 0);
            delete delivery.destination.handlers;
          }
        })
    }
}  