import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { Delivery } from '../delivery.model';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ModalImgComponent } from './modal-img/modal-img.component';

@Component({
  selector: 'app-detail-delivery',
  templateUrl: './detail-delivery.page.html',
  styleUrls: ['./detail-delivery.page.scss'],
})
export class DetailDeliveryPage implements OnInit {
  delivery: Delivery;
  vehicles: any;
  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private deliveriesService: DeliveriesService,
    private modalController: ModalController
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
}
