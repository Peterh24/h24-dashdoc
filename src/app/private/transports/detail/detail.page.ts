import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Map, tileLayer, marker, icon, LatLngBounds } from 'leaflet';
import { ConfigService } from 'src/app/services/config.service';
import { CompanyService } from 'src/app/services/company.service';
import { Browser } from '@capacitor/browser';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FILE_UPLOAD_MAX_SIZE, HTTP_REQUEST_UNKNOWN_ERROR } from 'src/app/services/constants';
import { ApiTransportService } from 'src/app/services/api-transport.service';
import { ModalImgComponent } from './modal-img/modal-img.component';
import { TransportOrderService } from 'src/app/services/transport-order.service';
import { TransportService } from 'src/app/services/transport.service';
import { Contact, Delivery, Message, Site, Transport } from '../../models/transport.model';

const DEBUG = false;

@Component({
    selector: 'app-detail',
    templateUrl: './detail.page.html',
    styleUrls: ['../basket/basket.page.scss', './detail.page.scss'],
    standalone: false
})
export class DetailPage implements OnInit {
  transport: Transport;
  viewDidEnter: boolean;
  map: Map;
  mapId: string;
  mapMarkers: any[];
  companyName: string;

  constructor(
    public config: ConfigService,
    public companyService: CompanyService,
    private route: ActivatedRoute,
    private apiTransport: ApiTransportService,
    private router: Router,
    private transportService: TransportService,
    private transportOrderService: TransportOrderService,
    private alertController: AlertController,
    private modalController: ModalController,
    private loadingController: LoadingController,
  ) { }

  ngOnInit() {
    this.map = null;
    this.mapId = 'map-' + new Date().valueOf (); // Fix map already initialized errors
    this.mapMarkers = [];
    this.viewDidEnter = false;

    this.route.paramMap.subscribe(
      paramMap => {
        if(!paramMap.has('id')) {
          this.router.navigateByUrl('/private/tabs/home', { replaceUrl: true })
          return;
        }

        this.transport = this.transportService.getTransport (paramMap.get('id'));
        if(!this.transport) {
          this.router.navigateByUrl('/private/tabs/home', { replaceUrl: true })
          return;
        }

        this.debug ("transport", this.transport);

        this.transport.deliveries?.forEach ((delivery: Delivery) => {
          if (delivery.origin?.address) {
            this.mapMarkers.push (delivery.origin.address);
          }
          if (delivery.destination?.address) {
            this.mapMarkers.push (delivery.destination.address);
          }
        });

        if (this.viewDidEnter) {
          this.initMap ();
        }
      });
  }

  debug (...log: any) {
    if (DEBUG) {
      console.log ("detail", ...log);
    }
  }

  ionViewDidEnter() {
    this.debug ("enter");
    this.viewDidEnter = true;

    if (!this.map && this.transport) {
      this.initMap ();
    }
  }

  ionViewWillLeave () {
    this.debug ("leave");
    /*
    if (this.map) {
      this.map.remove ();
      this.map = null;
    }
      */
  }

  getOrigin (transport: Transport) {
    return transport.deliveries?.[0]?.origin;
  }

  getDestination (transport: Transport) {
    const destinations = transport?.deliveries?.length;
    return destinations ? transport.deliveries[destinations - 1]?.destination : null;
  }

  getDateDay (date: string) {
    if (!date) {
      return '';
    }

    return new Date (date).toLocaleDateString (navigator.languages?.[0] || 'fr');
  }

  getOriginDate (transport: Transport) {
    const origin = this.getOrigin(transport);
    if (!origin) {
      return '';
    }

    return this.getDateDay(origin?.slots?.[0]?.start);
  }

  getDestinationDate (transport: Transport) {
    const destination = this.getDestination(transport);
    if (!destination) {
      return '';
    }

    return this.getDateDay(destination?.slots?.[0]?.start);
  }

  getAllPlannedLoads (transport: Transport) {
    const merchandises: any = {};

    transport.deliveries.map ((d: any) => d.planned_loads || d.loads).forEach ((loads: any) => {
      loads?.forEach ((load: any) => {
        merchandises[load.description] = true;
      })
    });

    return Object.keys (merchandises).sort ((a, b) => a.localeCompare (b)).join (',');
  }

  getContacts (transport: Transport) {
    const emails: any = {};

    transport.deliveries?.map((c: Delivery)=> c.tracking_contacts).forEach ((contacts: Contact[]) => {
      contacts.forEach ((contact) => {
        emails[contact?.email] = contact;
      });
    });

    return Object.values(emails).map ((c: any) => c?.first_name + " " + c?.last_name)
      .join (", ");
  }

  getAllDeliveries (transport: Transport) {
    const all: Site[] = [];
    const deliveries: Delivery[] = transport.deliveries;

    deliveries?.forEach ((delivery: any) => {
      if (delivery.origin?.address?.address) {
        all.push (delivery.origin);
      }

      if (delivery.destination?.address?.address) {
        all.push (delivery.destination);
      }
    });

    return all;
  }

  getSitePrefix (transport: Transport, index: number, first: boolean, last: boolean) {
    if (first) {
      return 'De'
    } else if (last) {
      return 'À'
    } else {
      return 'En passant par'
    }
  }

  getAllMessages (transport: any) {
    return transport.messages;
  }

  getDate(dateString : string) {
    if (!dateString) return "";

    const date = parseISO(dateString);
    const formattedDate = format(date, 'dd MMMM yyyy', { locale: fr });
    return formattedDate;
  }

  getHour(dateString : string) {
    if (!dateString) return "";

    const date = parseISO(dateString);
    const formattedTime = format(date, 'HH:mm');
    return formattedTime;
  }

  isImage (message: Message) {
    return message.url.match (/\.(jpg|jpeg|gif|png|webp)/i)
  }

  openMessage (message: any, dateString: string) {
    if (message.isImage) {
      this.openImg (message.document, dateString)
    } else {
      this.openFile (message.document);
    }
  }

  async openImg(img: string, dateString:string){
    const date = this.getDate(dateString);
    const hour = this.getHour(dateString);
    const modal = await this.modalController.create({
      component: ModalImgComponent,
      componentProps: {
        src: img,
        date: `${date} - ${hour}`
      },
      cssClass: 'image-modal'
    });
    modal.present();
  }

  openFile (file: string) {
    console.log(file);
    Browser.open({ url: file});
  }

  askFileToUpload () {
    document.getElementById ("file-upload").click ();
  }

  async onUploadFile (event: Event) {
    if ((event.target as HTMLInputElement).files) {
      let input = event.target as HTMLInputElement;
      let files = [];
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];

        if (file.size > FILE_UPLOAD_MAX_SIZE) {
          console.log ("Fichier trop gros"); // TODO
          continue;
        }

        const loading = await this.loadingController.create({
          keyboardClose: true,
          message: '<div class="h24loader"></div>',
          spinner: null,
        });

        await loading.present();

        this.apiTransport.createTransportMessage (this.transport, file).subscribe ({
          next: (res: any) => {
            loading.dismiss ();
          },
          error: async (res) => {
            loading.dismiss ();
            const alert = await this.alertController.create({
              header: "Erreur",
              message: HTTP_REQUEST_UNKNOWN_ERROR,
              buttons: ['Compris'],
            });

            await alert.present();
          }
        });
      }
    }
  }

  initMap() {
    this.debug ("initMap");

    this.map = new Map(this.mapId, {
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false
    }).setView([46, 2], 5);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    const cityMarkerIcon = icon({
      iconUrl:`https://h24-public-app.s3.eu-west-3.amazonaws.com/assets/global/img/cars/${(this.transport.license_plate || this.transport.vehicle || '20M3HAYON')}.png`,
      iconSize: [75, 42],
      iconAnchor: [24, 42],
      popupAnchor: [0, -42]
    });

    // map Initialisation
    const markerBounds:any = []; // Tableau pour stocker les coordonnées des marqueurs

    this.mapMarkers.forEach(markerItem => {
      if (markerItem && markerItem.latitude && markerItem.longitude) {
        const markerPosition:any = [markerItem.latitude, markerItem.longitude];

        marker(markerPosition, { icon: cityMarkerIcon })
          .bindPopup(`Ville de <strong>${markerItem.name}</strong>`, { autoClose: false })
          .on('click', () => {
            this.map.setView([markerItem.latitude, markerItem.longitude], 13);
          })
          .addTo(this.map);

        markerBounds.push(markerPosition); // Ajouter la position du marqueur au tableau des limites
      }
    });

    // Adapter la carte pour inclure tous les marqueurs
    if (markerBounds.length > 0) {
      this.map.fitBounds(markerBounds);

      const bounds = this.map.getBounds ();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      // Extend only the top (north)
      const extendedBounds = new LatLngBounds(sw, [ne.lat + (ne.lat - sw.lat) / 15, ne.lng]);
      this.map.fitBounds(extendedBounds);
    }
  }
}
