import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ApiTransportService } from 'src/app/services/api-transport.service';
import { AuthService } from 'src/app/services/auth.service';
import { API_URL, DASHDOC_API_URL, DASHDOC_COMPANY, TRANSPORTS_DRAFTS_KEY } from 'src/app/services/constants';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TransportService } from 'src/app/services/transport.service';
import { VehiclesService } from 'src/app/services/vehicles.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {
  typeName: any = {
    audiovisual: 'Audiovisuel',
    charter: 'Affrètement',
    air: 'Aérien'
  };

  vehicle: any;
  company: string;
  shipperReference: string;

  defaultTransport: any = {
    "carrier_address": {
      "company": {
        "pk": 1755557,
      },
      "is_verified": true,
    },
    "deliveries": [
    ],
    "segments": [
    ],
    "instructions": "Notes exploitant", // TODO
    "volume_display_unit": "m3",
    "business_privacy": false,
    "is_template": false,
    "is_multiple_compartments": false,
    "requires_washing": false,
    "send_to_trucker": false,
    "send_to_carrier": true,
    "analytics": {
        "has_price": false
    }
  }


  constructor(
    public transport: TransportService,
    private authService: AuthService,
    private notifications: NotificationsService,
    private vehicles: VehiclesService,
    private router: Router,
    private storage: Storage,
    private http: HttpClient,
    private alertController: AlertController,
    private apiTransport: ApiTransportService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter () {
    if (!this.transport.type) {
      this.router.navigateByUrl ('/private/tabs/transports/new-order');  
    }

    this.authService.loadCurrentUserDetail (this.authService.currentUser.id).subscribe ({
      next: (res) => { }
    });

    console.log ('summary', this.transport);
  }

  getContacts (contacts: any[]) {
    return contacts?.map ((c) => c.contact.first_name + " " + c.contact.last_name).join (", ");
  }

  getMerchandises (merchandises: any) {
    if (!merchandises) {
      return '';
    }

    return merchandises.map ((m: any) => m.description).sort ((a:string, b:string) => a.localeCompare (b)).join (', ');
  }

  formatSlot (slot: any) {
    const options: any = { weekday: 'long', day: '2-digit', month: 'long' };

    if (!slot?.start) {
      return "";
    }

    const day = '<b>' + new Date (slot.start).toLocaleString (navigator.languages?.[0] || 'fr', options) + '</b> ';

    if (slot.start && slot.end && slot.start != slot.end) {
      return day + ' entre ' + slot.start.split (/T/)[1]?.substr(0, 5) + ' et ' + slot.end.split (/T/)[1]?.substr(0, 5);
    } else {
      return day + ' à ' + slot.start.split (/T/)[1]?.substr(0, 5);
    }
  }

  editSection (type: string) {
    const urls: any = {
      type: '/private/tabs/transports/new-order',
      vehicle: '/private/tabs/transports/new-order/vehicle-choice',
      origins: '/private/tabs/transports/new-order/deliveries',
      destinations: '/private/tabs/transports/new-order/deliveries'
    }

    const url = urls[type];
    if (url) {
      this.router.navigateByUrl (url);
    }
  }

  async onSubmit (deleteDraft = false) {
    const transport = await this.buildTransport ();
    let request;

    if (transport.uid) {
      request = this.apiTransport.updateTransport (transport);
    } else {
      request = this.apiTransport.createTransport (transport);
    }

    // TODO
    //    request = this.http.post (`${API_URL}../transports/new`, transport);

    // TODO: gestion de l'upload des fichiers
    transport?.deliveries?.forEach ((delivery: any) => {
      delete delivery.file;
    });

    request.subscribe({
      next: async res => {
        // On renouvelle le token firebase pour éviter qu'il n'expire bientot
        this.notifications.resetToken ();

        if (this.transport.draftName && deleteDraft) {
          this.storage.get(DASHDOC_COMPANY).then ((pk) => {
            this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${pk}`).then ((drafts) => {
              delete drafts[this.transport.draftName];
              this.transport.draftName = null;
              this.storage.set (`${TRANSPORTS_DRAFTS_KEY}_${pk}`, drafts); 
            });
          });
        }
  
        const confirm = await this.alertController.create({
          header: 'Bravo, votre course a été enregistrée',
          message: 'Votre course a été validée et nous est parvenue, en cas de besoin d\'informations complementaires, nous vous contacterons sur le numero de téléphone présent dans votre profil.',
          buttons: ['Compris'],
        });

        await confirm.present();
        this.router.navigateByUrl('/private/tabs/transports/basket');
      },
      error: async (error) => {
        const alert = await this.alertController.create({
          header: "Echec de la requête: " + error.error.message,
          buttons: ['Compris'],
        });
  
        await alert.present();
      }
    });
  }

  async buildTransport () {
    if (!this.transport.trailers?.length) {
      this.transport.trailers.push({
        "licensePlate": this.transport.vehicle
      });
    }

    this.company = await this.storage.get(DASHDOC_COMPANY);

    const deliveries = this.buildDeliveries ();
    const segments = this.buildSegments (deliveries);

    let dataToApi = {
      ...this.defaultTransport,
      requested_vehicle: this.transport.vehicle,
      deliveries: deliveries,
      segments: segments
    };

    console.log(dataToApi);

    return dataToApi;
  }

  buildDeliveries () {
    let deliveries: any[] = [];

    if (this.transport.isMultipoint) {
      deliveries = this.transport.deliveries;
    } else {
      const origins = this.transport.getOrigins ();
      const destinations = this.transport.getDestinations ();

      if (destinations.length > 1) {
        // Single origin
        destinations.forEach ((d) => {
          delete d.origin;
          deliveries.push ({
            ...origins[0],
            ...d
          })
        });
      } else {
        // Single destination
        origins.forEach ((o) => {
          delete o.destination;
          deliveries.push ({
            ...destinations[0],
            ...o
          })
        });
      }
    }

    deliveries.forEach((delivery: any) => {
      delivery.shipper_reference = this.shipperReference;
      delivery.shipper_address = {
        company: {
          pk: this.company
        },
      };
    });

    return deliveries;
  }

  buildSegments (deliveries: any[]) {
    const segments: any[] = [];

    if (this.transport.isMultipoint) {
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
      if (this.transport.getDestinations ().length > 1) {
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
              trailer:this.transport.trailers
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
              trailer:this.transport.trailers
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

    segments.forEach ((segment) => segment.trailer = this.transport.trailers);

    return segments;
  }

  onSetOrderName (name: any, deleteDraft: string, modal: any) {
    if (name) {
      modal.dismiss ();

      this.shipperReference = name;
      this.onSubmit (false); // TODO
    }
  }

  async onSetDraftName (name: any, modal: any) {
    if (name) {
      modal.dismiss ();

      const transport = await this.buildTransport ();

      this.storage.get(DASHDOC_COMPANY).then ((pk) => {
        this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${pk}`).then ((drafts) => {
          if (!drafts) {
            drafts = {};
          }
          drafts[name] = transport;
          this.storage.set (`${TRANSPORTS_DRAFTS_KEY}_${pk}`, drafts);
        })
      });
    }
  }
}
