import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { Delivery } from '../delivery.model';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ModalImgComponent } from './modal-img/modal-img.component';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-detail-delivery',
  templateUrl: './detail-delivery.page.html',
  styleUrls: ['./detail-delivery.page.scss'],
})
export class DetailDeliveryPage implements OnInit {
  delivery: Delivery;
  vehicles: any;
  @ViewChild('map')mapRef: ElementRef;
  map: GoogleMap;

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

          console.log('delivery: ', this.delivery);

        })
      }


    )
  }

  ionViewDidEnter() {
    this.createMap();
  }

  async createMap() {
    this.map = await GoogleMap.create({
      id: 'h24-transport-map',
      apiKey: environment.mapsKey,
      element: this.mapRef.nativeElement,
      forceCreate: true,
      config: {
        center: {
          lat: 33.6,
          lng: -117.9
        },
        zoom: 8
      }
    })
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
}
