import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject } from "@angular/core";
import { Storage } from "@ionic/storage-angular";
import { API_URL, API_URL_V2, DASHDOC_API_URL, DASHDOC_COMPANY } from "./constants";
import { EMPTY, expand, map, mergeMap, of, reduce, tap } from "rxjs";
import { Address } from "../private/profile/address/address.model";
import { Request } from "../private/models/request.model";
import { Deliveries, Delivery } from "../private/deliveries/delivery.model";
import { compareAsc } from "date-fns";
import { Contact } from "../private/profile/contacts/contact.model";

export class ApiTransportH24v2 {
    static model: string = 'h24';
    static isDashdocModel: boolean = false;

    apiUrl: string;
    companyId: number;

    storage = inject (Storage);
    http = inject (HttpClient);

    constructor() {
        this.apiUrl = API_URL_V2;
        this.storage.get(DASHDOC_COMPANY).then((company) => {
            this.companyId = parseInt(company);
        });
    }

    loginUser (username: string, password: string) {
        return this.http.post(`${API_URL}login`, { email: username, password });
    }

    createUser (user: any) {
        return this.http.post(`${API_URL}app_users`, user);
    }

    updateUser (userId: number, user: any) {
        return this.http.put(`${API_URL}app_users/${userId}`, user);
    }

    getUserInfos (userId: number) {
        return this.http.get(`${this.apiUrl}user/${userId}`).pipe (
            map ((user: any) => ({ 
                firstname: user.first_name,
                lastname: user.last_name,
                email: user.email,
                phone: user.phone_number,
                tokens: []
             }))
        );
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
//        return of([{pk: 1, name: 'Société test'}]);
        return this.http.get(`${this.apiUrl}company`).pipe (
            tap ((companies: any) => {
                companies?.forEach ((company: any) => {
                    company.pk = company.id
                })
            })
        );
    }

    chooseCompany (companyId: number) {
        this.companyId = companyId;
        return this.http.post(`${this.apiUrl}company/switch-company`, {
            companyId
        });
    }

    getCompanyStatus () {
        return this.http.get(`${this.apiUrl}transports/?status__in=created,updated,confirmed,declined,verified`);
    }
    
    /* Contacts */
    getContacts () {
        return this.http.get(`${this.apiUrl}contacts`).pipe(
            expand ((res: any) => res.page < res.total ? this.http.get (`${this.apiUrl}contacts?page=${res.page + 1}`) : EMPTY),
            reduce ((acc: any, res: any) => acc.concat (res.items),  []),
            map ((acc: any) => acc.map ((contact: any, index: number) => new Contact (
              contact.id,
              contact.first_name,
              contact.lastname, // TODO
              contact.email,
              contact.phone_number,
              contact.company?.id,
              contact.company?.name
            ))));
    }

    createContact (contact: any) {
        contact.company = contact.company?.pk;
        contact.lastname = contact.last_name; // TODO
        return this.http.post(`${this.apiUrl}contacts`, contact).pipe(
            map ((res: any) => new Contact (res.id, contact.first_name, contact.last_name, contact.email, contact.phone_number, contact.company?.id, contact.company_name))
        );
    }

    updateContact (uid: string, contact: any) {
        return this.http.patch(`${this.apiUrl}contacts/${uid}`, contact).pipe(
            map ((res: any) => new Contact (uid, contact.first_name, contact.last_name, contact.email, contact.phone_number, contact.company?.pk, contact.company_name))
        )
    }

    deleteContact (uid: string) {
        return this.http.delete(`${this.apiUrl}contacts/${uid}`);
    }

    getContactsCompanies () {
        return this.getCompanies ([]);
    }

    /* Addresses */
    getAddresses () {
        return this.http.get(`${this.apiUrl}address`).pipe(
            expand((res: any) => {
              // TODO: tester multipage
              if (res.page < res.total) {
                return this.http.get(`${this.apiUrl}address?page=${res.page + 1}`);
              } else {
                return EMPTY;
              }
            }),
            reduce ((acc: any, res: any) => acc.concat (res.items),  []),
            tap((res: any) => {
                res?.forEach ((address: any) => {
                    address.pk = address.id
                })
            })
        )
    }

    createAddress (address: any) {
        // TODO
        address.is_demo = false;
        address.is_default = false;
        address.company = this.companyId;
        address.address_type = 'office';
        return this.http.post(`${this.apiUrl}address`, address).pipe (
            tap ((address: any) => {
                address.pk = address.id
            })
        )
    }

    updateAddress (addressId: any, address: any) {
        return this.http.patch(`${this.apiUrl}address/${addressId}`, address);
    }

    deleteAddress (addressId: any) {
        return this.http.delete(`${this.apiUrl}address/${addressId}`);
    }

    /* Transports */ 
    isTransportLastPageReached = false;
    nextTransportPage: string;

    createTransport (transport: any) {
        this.toDashdocTransport (transport);
        return this.http.post(`${this.apiUrl}transports/`, transport);
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