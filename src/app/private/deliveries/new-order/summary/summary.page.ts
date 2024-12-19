import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { AuthService } from 'src/app/services/auth.service';
import { DASHDOC_COMPANY, TRANSPORTS_DRAFTS_KEY } from 'src/app/services/constants';
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
    "instructions": "Notes exploitant",
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
    private vehicles: VehiclesService,
    private router: Router,
    private storage: Storage,
  ) { }

  ngOnInit() {
    this.transport.type = 'audiovisual';
    this.vehicles.fetchVehicles ().subscribe ({
      next: (vehicles) => {
        console.log (11, vehicles);
        this.vehicle = vehicles[0];
//        this.loadTest ();
      }
    })
  }

  ionViewWillEnter () {
    if (!this.transport.type) {
      this.router.navigateByUrl ('/private/tabs/transports/new-order');  
    }
  }

  getMerchandises (merchandises: any) {
    if (!merchandises) {
      return '';
    }

    return merchandises.map ((m: any) => m.description).sort ((a:string, b:string) => a.localeCompare (b)).join (',');
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

  async onSubmit () {
    const transport = await this.buildTransport ();

  }

  async buildTransport () {
    if (!this.transport.trailers) {
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
    const deliveries: any[] = [];

    if (this.transport.isMultipoint) {

    } else {
      const origins = this.transport.getOrigins ();
      const destinations = this.transport.getDestinations ();

      if (destinations.length > 1) {
        destinations.forEach ((d) => {
          deliveries.push ({
            ...d,
            origin: {...origins[0].origin},
          })
        });
      } else {
        origins.forEach ((o) => {
          deliveries.push ({
            ...o,
            destination: {...destinations[0].destination}
          })
        });
      }
    }

    deliveries.forEach((delivery: any) => {
      delivery.shipper_reference = this.shipperReference; // TODO
      delivery.shipper_address = {
        company: {
          pk: this.company
        },
      };
      delivery.tracking_contacts = [
        {
          contact: {
            company : {
              pk: this.company
            },
            first_name: this.authService.userInfo.firstname,
            last_name: this.authService.userInfo.lastname,
            email: this.authService.userInfo.email,
            phone_number: this.authService.userInfo.phone
          }
        }
      ]
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

        segments.push ({...d});
      })
    } else {
      if (this.transport.getDestinations ().length > 1) {
        // Single origin
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
      }
    }

    return segments;
  }

  onSetOrderName (name: any, modal: any) {
    if (name) {
      modal.dismiss ();

      if (this.transport.draftName) {
        this.storage.get (TRANSPORTS_DRAFTS_KEY).then ((drafts) => {
          delete drafts[this.transport.draftName];
          this.transport.draftName = null;
          this.storage.set (TRANSPORTS_DRAFTS_KEY, drafts); 
        });
      }

      this.shipperReference = name;
      this.onSubmit ();
    }
  }

  async onSetDraftName (name: any, modal: any) {
    if (name) {
      modal.dismiss ();

      const transport = await this.buildTransport ();

      let drafts: any = await this.storage.get (TRANSPORTS_DRAFTS_KEY) || {};

      drafts[name] = transport;

      this.storage.set (TRANSPORTS_DRAFTS_KEY, drafts);
    }
  }

  // TODO delete 
  loadTest () {
    this.transport.deliveries = [
      {
          "origin": {
              "address": {
                  "pk": 67797860,
                  "name": "Enlèvement 1",
                  "address": "25 rue de paris",
                  "city": "Paris",
                  "postcode": "75001",
                  "country": "FR",
                  "latitude": null,
                  "longitude": null
              },
              "instructions": "enlèvement 1",
              "slots": [
                  {
                      "start": "2024-10-04T10:23",
                      "end": "2024-10-04T10:23"
                  }
              ]
          },
          "planned_loads": [
              {
                  "id": "camera",
                  "description": "Caméra",
                  "quantity": 2,
                  "category": "bulk",
                  "complementary_information": ""
              }
          ],
          "destination": {
              "address": {
                  "pk": 67798196,
                  "name": "Livraison 1",
                  "address": "2 rue de lièvre",
                  "city": "Paris",
                  "postcode": "75005",
                  "country": "FR",
                  "latitude": 48.8797891,
                  "longitude": 2.3289635
              },
              "instructions": "livraison1",
              "slots": [
                  {
                      "start": "2024-10-11T00:00",
                      "end": "2024-10-11T00:00"
                  }
              ]
          },
          "shipper_reference": "reference",
          "shipper_address": {
              "company": {
                  "pk": 2054747
              }
          },
          "tracking_contacts": [
              {
                  "contact": {
                      "company": {
                          "pk": 2054747
                      },
                      "first_name": "David",
                      "last_name": "Ramboz",
                      "email": "david.ramboz@gmail.com",
                      "phone_number": "string"
                  }
              }
          ]
      }
    ] 
  }
}
