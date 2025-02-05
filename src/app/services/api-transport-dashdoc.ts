import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject } from "@angular/core";
import { Storage } from "@ionic/storage-angular";
import { API_URL, COMPANIES_KEY, DASHDOC_API_URL } from "./constants";
import { catchError, defaultIfEmpty, EMPTY, expand, filter, forkJoin, from, map, mergeMap, of, reduce, tap } from "rxjs";
import { Address } from "../private/profile/address/address.model";
import { Request } from "../private/models/request.model";
import { Deliveries, Delivery } from "../private/deliveries/delivery.model";
import { compareAsc } from "date-fns";
import { Contact } from "../private/profile/contacts/contact.model";
import { AuthService } from "./auth.service";
import { UtilsService } from "../utils/services/utils.service";

export class ApiTransportDashdoc {
    static model: string = 'dashdoc';
    static isDashdocModel: boolean = true;

    apiUrl: string;

    storage = inject (Storage);
    http = inject (HttpClient);
    utilsService = inject(UtilsService);

    constructor() {
        this.apiUrl = DASHDOC_API_URL;
    }

    loginUser (username: string, password: string) {
        return this.http.post(`${API_URL}login`, { username, password });
    }

    createUser (user: any) {
        return this.http.post(`${API_URL}app_users`, user);
    }

    updateUser (userId: number, user: any) {
        return this.http.put(`${API_URL}app_users/${userId}`, user);
    }

    getUserInfos (userId: number) {
        return this.http.get(`${API_URL}app_users/${userId}`);
    }

    changeUserPassword (userId: number, username: string, password: string, newpassword: string) {
        return this.http.post(`${API_URL}login`, { username: username, password }).pipe(
          mergeMap ((res) => {
            const headers = new HttpHeaders()
              .set ('Content-Type', 'application/merge-patch+json');
    
            return this.http.patch(`${API_URL}app_users/${userId}`, { password: newpassword }, { headers }).pipe (
            );
          })
        );
    }
    
    resetUserPasswordRequest (email: string) {
        return this.http.post(`${API_URL}../password/reset/request`, { email });
    }

    /* Companies */
    getCompanies (tokens: any) {
        return forkJoin([from(this.storage.get (COMPANIES_KEY)), from(this.storage.get (COMPANIES_KEY)).pipe (
          mergeMap ((companies) => forkJoin(
            tokens
              ?.filter ((token: any) => !companies?.find ((company: any) => company.token === token.token))
              ?.map ((token: any) =>
                this.http.get(`${DASHDOC_API_URL}addresses/`, {
                  headers:  new HttpHeaders().set('Authorization', `Token ${token.token}`)
                }).pipe (
                  catchError (err => EMPTY),
                  map ((res: any) => ({ ...res.results[0].created_by, token: token.token })),
                )
              )
          )),
          defaultIfEmpty ([]),
        )]).pipe (
          map((res: any) => (res[0] /* old */ || []).concat (res[1] /* new */ || [])),
          // suppression des anciens tokens
          map ((allCompanies: any) => allCompanies.filter ((company: any) => tokens.find ((token: any) => token.token == company.token))),
          tap((allCompanies: any) => {
            this.storage.set (COMPANIES_KEY, allCompanies);
          })
        )
    }

    chooseCompany (companyId: number) {
        return EMPTY
    }

    getCompanyStatus () {
        return this.http.get(`${this.apiUrl}transports/?status__in=created,updated,confirmed,verified`).pipe (
          map ((res: any) => res.count)
        );
    }
    
    /* Contacts */
    getContacts () {
        return this.http.get(`${this.apiUrl}contacts/`).pipe(
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
        return this.http.post(`${this.apiUrl}contacts/`, contact).pipe(
            map ((res: any) => new Contact (res.uid, contact.first_name, contact.last_name, contact.email, contact.phone_number, contact.company?.pk, contact.company_name))
        );
    }

    updateContact (uid: string, contact: any) {
        return this.http.patch(`${this.apiUrl}contacts/${uid}/`, contact).pipe(
            map ((res: any) => new Contact (uid, contact.first_name, contact.last_name, contact.email, contact.phone_number, contact.company?.pk, contact.company_name))
        )
    }

    deleteContact (uid: string) {
        return this.http.delete(`${this.apiUrl}contacts/${uid}/`);
    }

    getContactsCompanies () {
        return this.http.get(`${this.apiUrl}companies/`).pipe(
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
        return this.http.get(`${this.apiUrl}addresses/`).pipe(
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
        return this.http.post(`${this.apiUrl}addresses/`, address)
    }

    updateAddress (addressId: any, address: any) {
        return this.http.patch(`${this.apiUrl}addresses/${addressId}`, address);
    }

    deleteAddress (addressId: any) {
        return this.http.delete(`${this.apiUrl}addresses/${addressId}/`);
    }

    /* Vehicles */
    getVehicles () {
        return this.http.get(`${API_URL}vehicles`).pipe (
          map((res: any) => res['hydra:member']),
        );
    }

    /* Transports */ 
    isTransportLastPageReached = false;
    nextTransportPage: string;

    createTransport (transport: any) {
        this.toDashdocTransport (transport);
        return this.http.post(`${this.apiUrl}transports/`, transport).pipe (
          mergeMap (res => this.http.post (`${API_URL}../transports/new`, transport))
        )
    }

    updateTransport (transport: any) {
        this.toDashdocTransport (transport);

        const headers = new HttpHeaders()
            .set ('Content-Type', 'application/merge-patch+json');

        return this.http.patch(`${this.apiUrl}transports/${transport.uid}`, transport, { headers });
    }

    getTransports (status: string = null) {
        if (this.isTransportLastPageReached) {
            return EMPTY; 
        }
        const url = this.nextTransportPage ? this.nextTransportPage : `${this.apiUrl}transports/` + (status ? '?status__in=' + status : '');

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

        const deliveriesData = data.deliveries?.map((delivery: any) => {
            const { uid, origin, destination, loads, tracking_contacts } = delivery;
            return { uid, origin, destination, loads, tracking_contacts };
        });

        const segmentsData = data.segments?.map((segment: any) => {
          const { uid, origin, destination, loads, tracking_contacts } = segment;
          return { uid, origin, destination, loads, tracking_contacts };
        });

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
            data.deliveries?.[0]?.shipper_reference,
            data.status,
            data.global_status,
            statuses,
            data.pricing_total_price,
            data.quotation_total_price,
            this.sortDeliveries (deliveriesData),
            segmentsData,
            data.messages,
            data.documents,
            licensePlate,
            data.requested_vehicle,
            data.carbon_footprint
        )
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

    // TODO remove this
    toH24Apiv1 (transport: any) {
      transport.created = new Date().toISOString();
      transport.created_by = "Dev test";
      transport.creation_method = "api";
      transport.instructions = "Instructions";
      transport.shipper_reference = transport?.deliveries?.[0]?.shipper_reference;

      transport.deliveries?.forEach ((delivery: any) => {
        delivery.origin.loading_instructions = delivery.origin.instructions || "instructions";
        delivery.origin.unloading_instructions = delivery.origin.instructions || "instructions";

        delivery.destination.loading_instructions = delivery.destination.instructions || "instructions";
        delivery.destination.unloading_instructions = delivery.destination.instructions || "instructions";
      });
    }

    toDashdocTransport (transport: any) {
      this.toH24Apiv1 (transport);

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