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
import { UtilsService } from "../utils/services/utils.service";

export class ApiTransportH24v2 {
    static model: string = 'h24';
    static isDashdocModel: boolean = false;

    apiUrl: string;
    companyId: number;

    storage = inject (Storage);
    http = inject (HttpClient);
    utilsService = inject(UtilsService);

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
        return this.http.post(`${this.apiUrl}../../user`, {
            first_name: user.firstname,
            last_name: user.lastname,
            email: user.email,
            phone_number: user.phone,
            password: user.password,
            carrier: 2, // TODO
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
                firstname: user.first_name,
                lastname: user.last_name,
                email: user.email,
                phone: user.phone_number,
                tokens: []
             }))
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
        return this.http.get(`${this.apiUrl}transports/?status__in=created,updated,confirmed,declined,verified`).pipe (
            map ((res: any) => res?.items?.length) // TODO
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
        contact.company = contact.company?.pk;
        return this.http.post(`${this.apiUrl}contacts`, contact).pipe(
            map ((res: any) => new Contact (res.id, contact.first_name, contact.last_name, contact.email, contact.phone_number, contact.company?.id, contact.company_name))
        );
    }

    // TODO
    inviteUser (contact: Contact) {
        return this.http.post (`${this.apiUrl}user/invite`, { name: contact.last_name, email: contact.email, company: contact.company, phone: contact.phone_number })
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
              if (res.page < res.lastPage) {
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
        address.address_type = 'default';
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

    /* Vehicles */
    getVehicles () {
        // TODO
        /*
        return of({
            "@context":"\/api\/contexts\/Vehicle",
            "@id":"\/api\/vehicles",
            "@type":"hydra:Collection",
            "hydra:totalItems":5,
            "hydra:member":[
                {
                    "@id":"\/api\/vehicles\/1",
                    "@type":"Vehicle",
                    "id":1,"model":"Man","type":"20M3","length":7,"depth":2,
                    "heightCar":3,"heightChest":2,"payload":700,"price":180,
                    "licensePlate":"20M3HAYON","hayon":true
                }]
            });
*/
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

        return this.http.patch(`${this.apiUrl}transports/${transport.uid}`, transport, { headers });
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

        const deliveriesData = data.deliveries.map((delivery: any) => {
            const uid = delivery.id;
            // TODO: origin & destination dans l'api, Loads & TrackingContacts en minuscule
            const origin = delivery.sites.find ((site: any) => site.reference == 'LOADING');
            const destination = delivery.sites.find ((site: any) => site.reference == 'UNLOADING');
            const loads = delivery.Loads;
            const tracking_contacts = delivery.TrackingContacts;
            return { uid, origin, destination, loads, tracking_contacts };
        });

        const licensePlate = data.segments?.[0]?.trailers?.[0] ? data.segments?.[0].trailers?.[0]?.license_plate : '';

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
            data.id,
            data.created_at,
            data.deliveries[0].shipper_reference,
            data.trasnport_status,
            data.global_status,
            statuses,
            data.pricing_total_price,
            data.quotation_total_price,
            this.sortDeliveries(deliveriesData),
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
  
    fromH24Transport (transport: any) {
        transport?.deliveries?.forEach ((delivery: any) => {
            if (delivery.origin) {
              delivery.origin.handlers = parseInt(delivery.origin.action || 0);
            }

            if (delivery.destination) {
              delivery.destination.handlers = parseInt(delivery.destination.action || 0);
            }
          });
    }

    toH24Transport (transport: any) {
        const deliveries = transport.deliveries;
        const segments = transport.segments;

        transport.creation_method = "api";
        transport.shipper_reference = deliveries?.[0]?.shipper_reference;
        transport.carrier = 2; // TODO! ne pas mettre en dur
        transport.company = this.companyId;
        transport.shipper_address = this.companyId; // TODO
        transport.requested_vehicle = 'VAN'; // TODO

        deliveries?.forEach ((delivery: any) => {
            delivery.shipper_address = this.companyId;
            delivery.load = delivery.planned_loads;
            delete delivery.planned_loads;
            delivery.load.forEach ((load: any) => {
                load.volume_display_unit = 'm3';
            });

            delivery.tracking_contact = delivery.tracking_contacts?.map ((contact: any) => 
                ({ contact: contact.contact.id, reference: 'shipper' }) // TODO: quelle référence
            );
            delete delivery.tracking_contacts;

            delivery.origin = this.toH24Site (delivery.origin);
            delivery.destination = this.toH24Site (delivery.destination);

            if (delivery.origin) {
                delivery.origin.action = String(delivery.origin.handlers || 0);
                delete delivery.origin.handlers;
            }
            if (delivery.destination) {
                delivery.destination.action = String(delivery.destination.handlers || 0);
                delete delivery.destination.handlers;
            }
        });

        segments?.forEach ((segment: any) => {
            segment.origin = this.toH24Site (segment.origin);
            segment.destination = this.toH24Site (segment.destination);
            segment.vehicle = 1; // TODO
        })
    }

    toH24Site (site: any) {
        if (!site) return null;

        return {
            address: site.address.pk,
            instructions: site.instructions,
            action: site.action,
            slots: site.slots
        };
    }
}  