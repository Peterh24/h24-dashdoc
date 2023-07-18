import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { Delivery } from '../delivery.model';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ModalImgComponent } from './modal-img/modal-img.component';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { Map, tileLayer, marker, icon } from 'leaflet';
import { Marker } from '../marker.model';

@Component({
  selector: 'app-detail-delivery',
  templateUrl: './detail-delivery.page.html',
  styleUrls: ['./detail-delivery.page.scss'],
})
export class DetailDeliveryPage implements OnInit {
  delivery: Delivery;
  vehicles: any;
  map: Map;
  mapMarkers:Array<Marker> = [];
  cityMarkerIcon: any = icon({
    iconUrl:'https://h24-public-website.s3.eu-west-3.amazonaws.com/assets/logo-noir-sur-fond-blanc.jpeg',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
  })
  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private deliveriesService: DeliveriesService,
    private modalController: ModalController,
    private fileOpener: FileOpener
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(
      paramMap => {
        if(!paramMap.has('id')) {
          this.navController.navigateBack('/private/tabs/transports')
          return;
        }
        this.deliveriesService.getDelivery(paramMap.get('id')).subscribe(delivery => {
          this.delivery = delivery;
          if(!this.delivery) {
            this.navController.navigateBack('/private/tabs/transports')
            return;
          }

          this.delivery.deliveries.forEach(delivery => {
            const destination = delivery.destination.address;
            const origin = delivery.origin.address;

            // Check if the destination city is not equal to the destination origin
            if (destination.city !== origin.city) {
              // Check if the city is already in array
              if (!this.mapMarkers.find(marker => marker.name === destination.city)) {
                this.mapMarkers.push({ name: destination.city, latitude: destination.latitude, longitude: destination.longitude });
              }
            }

            // Check if the origin city is not equal to the destination city
            if (origin.city !== destination.city) {
              // Check if the city is already in array
              if (!this.mapMarkers.find(marker => marker.name === origin.city)) {
                this.mapMarkers.push({ name: origin.city, latitude: origin.latitude, longitude: origin.longitude });
              }
            }

            console.log('this.mapMarkers: ', this.mapMarkers);
          });
        })
      }
    )
  }

  ionViewDidEnter() {
    return this.initMap();
  }


  getDate(dateString : string) {
    const date = parseISO(dateString);
    const formattedDate = format(date, 'dd MMMM yyyy', { locale: fr });
    return formattedDate;
  }

  getHour(dateString : string) {
    const date = parseISO(dateString);
    const formattedTime = format(date, 'HH:mm');
    return formattedTime;
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

  openPdf(pdf: string) {
    this.fileOpener.open(pdf, 'application/pdf')
    .then(() => {
      console.log('File is opened')
    })
    .catch(e => {
      console.log('Error opening file', e)
    });
  }

  initMap() {
    // map Initialisation
    this.map = new Map('map').setView([46, 2], 5);
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    const markerBounds:any = []; // Tableau pour stocker les coordonnées des marqueurs

    this.mapMarkers.forEach(markerItem => {
      const markerPosition:any = [markerItem.latitude, markerItem.longitude];

      marker(markerPosition, { icon: this.cityMarkerIcon })
        .bindPopup(`Ville de <strong>${markerItem.name}</strong>`, { autoClose: false })
        .on('click', () => {
          this.map.setView([markerItem.latitude, markerItem.longitude], 13);
        })
        .addTo(this.map);

      markerBounds.push(markerPosition); // Ajouter la position du marqueur au tableau des limites
    });

    // Adapter la carte pour inclure tous les marqueurs
    if (markerBounds.length > 0) {
      this.map.fitBounds(markerBounds);
    }

    return;
  }
}
