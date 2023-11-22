import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { Delivery } from '../delivery.model';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ModalImgComponent } from './modal-img/modal-img.component';
import { Map, tileLayer, marker, icon } from 'leaflet';
import { Marker } from '../marker.model';
import { Browser } from '@capacitor/browser';

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
  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private deliveriesService: DeliveriesService,
    private modalController: ModalController,
  ) { }
  

  ngOnInit() {
    this.route.paramMap.subscribe(
      paramMap => {
        if(!paramMap.has('id')) {
          this.navController.navigateBack('/private/tabs/transports')
          return;
        }
        this.deliveriesService.deliveries.subscribe((data) => {
          console.log('data: ', data);
        })
         this.deliveriesService.getDelivery(paramMap.get('id')).subscribe(delivery => {
          this.delivery = delivery;
          console.log("Id",paramMap.get('id'))
          console.log("delivery: ", delivery);
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
              if (!this.mapMarkers.find(marker => marker.latitude === destination.latitude)) {
                this.mapMarkers.push({ name: destination.city, latitude: destination.latitude, longitude: destination.longitude });
              }
            }

            // Check if the origin city is not equal to the destination city
            if (origin.city !== destination.city) {
              // Check if the city is already in array
              if (!this.mapMarkers.find(marker => marker.latitude === origin.latitude)) {
                this.mapMarkers.push({ name: origin.city, latitude: origin.latitude, longitude: origin.longitude });
              }
            }
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
    console.log(pdf);
    Browser.open({ url: pdf});
    // this.fileOpener.open(pdf, 'application/pdf')
    // .then(() => {
    //   console.log('File is opened')
    // })
    // .catch(e => {
    //   console.log('Error opening file', e)
    // });
  }

  initMap() {
    const cityMarkerIcon = icon({
      iconUrl:`https://h24-public-app.s3.eu-west-3.amazonaws.com/assets/global/img/cars/${(this.delivery.licensePlate || this.delivery.requested_vehicle)}.jpg`,
      iconSize: [75, 42],
      iconAnchor: [24, 42],
      popupAnchor: [0, -42]
    })
    // map Initialisation
    this.map = new Map('map').setView([46, 2], 5);
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    const markerBounds:any = []; // Tableau pour stocker les coordonnées des marqueurs

    this.mapMarkers.forEach(markerItem => {
      const markerPosition:any = [markerItem.latitude, markerItem.longitude];

      marker(markerPosition, { icon: cityMarkerIcon })
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
