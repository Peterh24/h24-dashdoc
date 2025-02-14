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
import { ConfigService } from "./config.service";

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
                firstname: user.first_name,
                lastname: user.last_name,
                email: user.email,
                phone: user.phone_number,
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
            tap ((companies: any) => {
                companies?.forEach ((company: any) => {
                    company.pk = company.id
                })
            })
        );
    }

    chooseCompany (companyId: number) {
        return this.http.post(`${this.apiUrl}company/switch-company`, {
            companyId
        }).pipe (
            tap (() => {
                this.companyId = companyId;
                this.config.setCurrentCompany (companyId);
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
        contact.company = contact.company?.pk;
        return this.http.post(`${this.apiUrl}contacts`, contact).pipe(
            map ((res: any) => new Contact (res.id, res.first_name, res.last_name, res.email, res.phone_number, res.company?.id, res.company?.name))
        );
    }

    inviteUser (contact: Contact) {
        return this.http.post (`${this.apiUrl}user/invite`, { name: contact.last_name, email: contact.email, company: contact.company, phone: contact.phone_number })
    }

    updateContact (uid: string, contact: any) {
        return this.http.patch(`${this.apiUrl}contacts/${uid}`, contact).pipe(
            map ((res: any) => new Contact (uid, res.first_name, res.last_name, res.email, res.phone_number, res.company?.id, res.company?.name))
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
        address.is_demo = false;
        address.is_default = false;
        address.company = this.companyId;
        return this.http.post(`${this.apiUrl}address`, address).pipe (
            tap ((address: any) => {
                address.pk = address.id
            })
        )
    }

    updateAddress (addressId: any, address: any) {
        return this.http.patch(`${this.apiUrl}address/${addressId}`, address).pipe (
            tap ((address: any) => {
                address.pk = address.id
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
            String(data.id),
            data.created_at,
            data.shipper_reference,
            data.transport_status,
            data.global_status,
            statuses,
            data.pricing_total_price,
            data.quotation_total_price,
            this.sortDeliveries(deliveriesData),
            null, // TODO
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
            address: { remote_id: site.address.pk }
        };
    }

    createTransportMessage (transport: any, file: any, type: string = null, delivery: number = null) {
        return EMPTY;
    }
}