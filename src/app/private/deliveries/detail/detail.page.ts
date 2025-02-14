import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { Map, tileLayer, marker, icon, LatLngBounds } from 'leaflet';
import { ConfigService } from 'src/app/services/config.service';
import { CompanyService } from 'src/app/services/company.service';
import { Browser } from '@capacitor/browser';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TransportService } from 'src/app/services/transport.service';
import { FILE_UPLOAD_MAX_SIZE, HTTP_REQUEST_UNKNOWN_ERROR } from 'src/app/services/constants';
import { ApiTransportService } from 'src/app/services/api-transport.service';
import { ModalImgComponent } from './modal-img/modal-img.component';

const DEBUG = false;

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['../basket/basket.page.scss', './detail.page.scss'],
})
export class DetailPage implements OnInit {
  transport: any;
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
    private deliveriesService: DeliveriesService,
    private transportService: TransportService,
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
          this.router.navigateByUrl('/private/tabs/transports/deliveries')
          return;
        }

        this.deliveriesService.getDelivery (paramMap.get('id')).subscribe ({
          next: (res) => {
            if(!res) {
              this.router.navigateByUrl('/private/tabs/transports/deliveries')
              return;
            }
    
            this.transport = res;
            this.debug ("transport", res);
            this.transport.deliveries?.forEach ((delivery: any) => {
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
          }
        })
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

  getOrigin (delivery: any) {
    return delivery.deliveries?.[0]?.origin;
  }

  getDestination (delivery: any) {
    const destinations = delivery?.deliveries?.length;
    return destinations ? delivery.deliveries[destinations - 1]?.destination : {};
  }

  getDateDay (date: string) {
    if (!date) {
      return '';
    }

    return new Date (date).toLocaleDateString (navigator.languages?.[0] || 'fr');
  }

  getOriginDate (delivery: any) {
    const origin = this.getOrigin(delivery);
    if (!origin) {
      return '';
    }

    return this.getDateDay(origin?.slots?.[0]?.start);
  }

  getDestinationDate (delivery: any) {
    const destination = this.getDestination(delivery);
    if (!destination) {
      return '';
    }

    return this.getDateDay(destination?.slots?.[0]?.start);
  }

  getAllPlannedLoads (delivery: any) {
    const merchandises: any = {};

    delivery.deliveries.map ((d: any) => d.planned_loads || d.loads).forEach ((loads: any) => {
      loads?.forEach ((load: any) => { 
        merchandises[load.description] = true;
      })
    });

    return Object.keys (merchandises).sort ((a, b) => a.localeCompare (b)).join (',');
  }

  getContacts (delivery: any) {
    const contacts: any = {};

    delivery.deliveries?.map((c: any)=> c.tracking_contacts).flat().forEach ((contact: any) => {
      contacts[contact?.contact?.email] = contact;
    });

    return Object.values(contacts).map ((c: any) => c?.contact?.first_name + " " + c?.contact?.last_name)
      .join (", ");
  }

  getAllDeliveries (delivery: any) {
    const all: any = [];
    const deliveries = this.transportService.loadDeliveries (delivery?.deliveries);

    deliveries?.forEach ((delivery: any) => {
      if (delivery.origin?.address?.address) {
        all.push (delivery.origin);
      }

      if (delivery.destination?.address?.address) {
        all.push (delivery.destination);
      }
    });

    if (all.length) {
      all[0].prefix = 'De';
      all[all.length - 1].prefix = 'À'
    }

    return all;
  }

  getAllMessages (delivery: any) {
    delivery.messages.forEach ((message: any) => {
      message.isImage = message?.document?.match (/\.(jpg|jpeg|gif|png|webp)/i);
      message.isPdf = message?.document?.match (/\.pdf/i);
    });

    return delivery.messages;
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
            this.transport.messages.push ({
              document: res.document,
              created: res.created,
              isImage: res.document.match (/\.(jpg|jpeg|gif|png|webp)/i)
            });
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
      iconUrl:`https://h24-public-app.s3.eu-west-3.amazonaws.com/assets/global/img/cars/${(this.transport.licensePlate || this.transport.requested_vehicle || '20M3HAYON')}.png`,
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
