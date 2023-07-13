import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { Delivery } from '../delivery.model';

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

}
