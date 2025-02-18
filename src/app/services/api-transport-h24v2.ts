import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject } from "@angular/core";
import { Storage } from "@ionic/storage-angular";
import { API_URL, API_URL_V2, DASHDOC_COMPANY } from "./constants";
import { EMPTY, expand, map, reduce, tap } from "rxjs";
import { Address } from "../private/profile/address/address.model";
import { Contact } from "../private/profile/contacts/contact.model";
import { UtilsService } from "../utils/services/utils.service";
import { ConfigService } from "./config.service";
import { Company } from "../private/models/company.model";

export class ApiTransportH24v2 {
    static model: string = 'h24';
    static isDashdocModel: boolean = false;

    apiUrl: string;
    companyId: number; // TODO: use config.currentCompany

    config = inject (ConfigService);
    storage = inject (Storage);
    http = inject (HttpClient);
    utilsService = inject(UtilsService);

    constructor() {
        this.apiUrl = API_URL_V2;
    }

    async init () {
        const company = await this.storage.get(DASHDOC_COMPANY);
        this.companyId = company ? parseInt(company) : null;
    }

    /* Users */
    loginUser (username: string, password: string) {
        return this.http.post(`${API_URL}login`, { email: username, password });
    }

    createUser (user: any) {
        return this.http.post(`${this.apiUrl}../../user`, {
            first_name: user.firstname,
            last_name: user.lastname,
            email: user.email,
            phone_number: user.phone,
            password: user.password,
        });
    }

    updateUser (userId: number, user: any) {
        return this.http.patch(`${this.apiUrl}user/${userId}`, {
            first_name: user.firstname,
            last_name: user.lastname,
            phone_number: user.phone
        });
    }

    getUserInfos (userId: number) {
        return this.http.get(`${this.apiUrl}user/${userId}`).pipe (
            map ((user: any) => ({
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number,
                tokens: []
             }),
             tap ((user: any) => {
                if (user.firstname) {
                    user.firstname = user.firstname?.[0]?.toUpperCase() + user.firstname?.slice(1);
                }
             })
            )
        );
    }

    changeUserPassword (userId: number, username: string, password: string, newpassword: string) {
        return this.http.post(`${this.apiUrl}user/reset-password`, { new_password: newpassword, old_password: password });
    }

    resetUserPasswordRequest (email: string) {
        return this.http.post(`${API_URL}../password/reset/request`, { email });
    }

    /* Companies */
    getCompanies (tokens: any) {
        return this.http.get(`${this.apiUrl}user/companies`).pipe (
            map ((res: any) => res.items),
            map ((companies: any[]) => companies.map ((company) => new Company (company.id, company.name))),
        );
    }

    chooseCompany (companyId: number) {
        return this.http.post(`${this.apiUrl}company/switch-company`, {
            companyId
        }).pipe (
            tap (() => {
                this.companyId = companyId;
            })
        );
    }

    getCompanyStatus () {
        return this.http.get(`${this.apiUrl}transports/?status__in=created,updated,confirmed,verified`).pipe (
            map ((res: any) => res?.total)
        )
    }

    /* Contacts */
    getContacts () {
        return this.http.get(`${this.apiUrl}contacts`).pipe(
            expand ((res: any) => res.page < res.lastPage ? this.http.get (`${this.apiUrl}contacts?page=${res.page + 1}`) : EMPTY),
            reduce ((acc: any, res: any) => acc.concat (res.items),  []),
            map ((acc: any) => acc.map ((contact: any, index: number) => new Contact (
              contact.id,
              contact.first_name,
              contact.last_name,
              contact.email,
              contact.phone_number,
              contact.company?.id,
              contact.company?.name,
              contact.has_pending_invite,
            ))));
    }

    createContact (contact: any) {
        contact.company = contact.company?.id;
        return this.http.post(`${this.apiUrl}contacts`, contact).pipe(
            map ((res: any) => new Contact (res.id, res.first_name, res.last_name, res.email, res.phone_number, res.company?.id, res.company?.name))
        );
    }

    inviteUser (contact: Contact) {
        return this.http.post (`${this.apiUrl}user/invite`, { name: contact.last_name, email: contact.email, company: contact.company, phone: contact.phone_number })
    }

    updateContact (id: string, contact: any) {
        contact.company = contact.company?.id;
        return this.http.patch(`${this.apiUrl}contacts/${id}`, contact).pipe(
            map ((contact: any) => {
                return contact ? new Contact (
                    id,
                    contact.first_name,
                    contact.last_name,
                    contact.email,
                    contact.phone_number,
                    contact.company?.id,
                    contact.company?.name) : null
                })
        )
    }

    deleteContact (id: string) {
        return this.http.delete(`${this.apiUrl}contacts/${id}`);
    }

    getContactsCompanies () {
        return this.getCompanies ([]);
    }

    /* Addresses */
    getAddresses () {
        return this.http.get(`${this.apiUrl}address`).pipe(
            expand((res: any) => {
              // TODO: tester multipage
              if (res.page < res.lastPage) {
                return this.http.get(`${this.apiUrl}address?page=${res.page + 1}`);
              } else {
                return EMPTY;
              }
            }),
            reduce ((acc: any, res: any) => acc.concat (res.items),  []),
        )
    }

    createAddress (address: any) {
        address.is_demo = false;
        address.is_default = false;
        address.company = this.companyId;
        return this.http.post(`${this.apiUrl}address`, address).pipe (
            map ((address: any) => {
              return new Address (
                address.id,
                address.name,
                address.address,
                address.city,
                address.postcode,
                address.country,
                address.instructions,
                address.latitude,
                address.longitude)
            })
        )
    }

    updateAddress (addressId: any, address: any) {
        address.company = this.companyId;
        return this.http.patch(`${this.apiUrl}address/${addressId}`, address).pipe (
            map ((address: any) => {
              return address ? new Address (
                address.id,
                address.name,
                address.address,
                address.city,
                address.postcode,
                address.country,
                address.instructions,
                address.latitude,
                address.longitude) : null
          })
        )
    }

    deleteAddress (addressId: any) {
        return this.http.delete(`${this.apiUrl}address/${addressId}`);
    }

    /* Vehicles */
    getVehicles () {
        return this.http.get(`${this.apiUrl}vehicles`).pipe (
            map ((res: any) => (res.items)),
            tap((vehicles: any) => {
                vehicles.forEach ((vehicle: any) => {
                    vehicle.licensePlate = vehicle.license_plate
                })
            }),
        );
    }

    /* Transports */
    isTransportLastPageReached = false;
    nextTransportPage: string;

    createTransport (transport: any) {
        this.toH24Transport (transport);
        console.log ('create transport', transport);
        return this.http.post(`${this.apiUrl}transports`, transport);
    }

    updateTransport (transport: any) {
        this.toH24Transport (transport);

        const headers = new HttpHeaders()
            .set ('Content-Type', 'application/merge-patch+json');

        return this.http.patch(`${this.apiUrl}transports/${transport.id}`, transport, { headers });
    }

    // TODO: gestion des statuts
    getTransports (status: string = null) {
        if (this.isTransportLastPageReached) {
            return EMPTY;
        }
        const url = this.nextTransportPage ? this.nextTransportPage : `${this.apiUrl}transports` + (status ? '?status__in=' + status : '');

        return this.http.get(url).pipe(
            map((resData: any) => {
                if (resData.page === resData.lastPage) {
                    this.isTransportLastPageReached = true;
                    this.nextTransportPage = null;
                } else {
                    this.nextTransportPage = `${this.apiUrl}transports?page=${resData.page + 1}`;
                }

                return resData.items.map ((data:any) => this.loadTransport (data));
            }),
//            reduce((deliveries: Delivery[], results: Delivery[]) => deliveries.concat(results), [])
        );
    }

    resetTransports () {
        this.nextTransportPage = null;
        this.isTransportLastPageReached = false;
    }

    loadTransport (data: any) {
        this.fromH24Transport (data);

        data.deliveries = data.deliveries.map((delivery: any) => this.loadDelivery (delivery));
        data.segments = data.segments.map((segment: any) => this.loadDelivery (segment));
        data.license_plate = data.segments?.[0]?.trailers?.[0] ? data.segments?.[0].trailers?.[0]?.license_plate : ''; // TODO

        return data;

    }

    loadDelivery (delivery: any) {
      const id = delivery.id;
      // TODO: origin & destination dans l'api
      const origin = delivery.sites.find ((site: any) => site.siteReference == 'LOADING');
      const destination = delivery.sites.find ((site: any) => site.siteReference == 'UNLOADING');
      const loads = delivery.loads;
      const tracking_contacts = delivery.tracking_contacts;

      if (origin) {
          origin.handlers = origin.manutentionnaire;
          origin.guarding = origin.hasSecureGuarding;
      }

      if (destination) {
          destination.handlers = destination.manutentionnaire;
          destination.guarding = destination.hasSecureGuarding;
      }

      return { id, origin, destination, loads, tracking_contacts };
    }

    fromH24Transport (transport: any) {
    }

    toH24Transport (transport: any) {
        const deliveries = transport.deliveries;
        const segments = transport.segments;

        transport.creation_method = "api";
        transport.shipper_reference = deliveries?.[0]?.shipper_reference;
        transport.company = this.companyId;
        transport.shipper_address = this.companyId; // TODO

        deliveries?.forEach ((delivery: any) => {
            delivery.shipper_address = { remote_id: this.companyId };
            delivery.loads = delivery.planned_loads;
            delete delivery.planned_loads;
            delivery.loads.forEach ((load: any) => {
                load.volume_display_unit = 'm3';
            });

            delivery.tracking_contacts = delivery.tracking_contacts?.map ((contact: any) =>
                ({ contact: { remote_id: contact.contact.id }, reference: 'shipper' }) // TODO: quelle référence
            );

            delivery.origin = this.toH24Site (delivery.origin);
            delivery.destination = this.toH24Site (delivery.destination);
        });

        segments?.forEach ((segment: any) => {
            segment.origin = this.toH24Site (segment.origin);
            segment.destination = this.toH24Site (segment.destination);
        })
    }

    toH24Site (site: any) {
        if (!site) return null;
        return {
            ...site,
            has_secure_guarding: !!site.guarding,
            manutention: site.handlers || 0,
            address: { remote_id: site.address.id }
        };
    }

    createTransportMessage (transport: any, file: any, type: string = null, delivery: number = null) {
        return EMPTY;
    }
}