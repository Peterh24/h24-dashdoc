import { Component, OnInit } from '@angular/core';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { Delivery } from './delivery.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { StatusService } from 'src/app/utils/services/status.service';

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.page.html',
  styleUrls: ['./deliveries.page.scss'],
})
export class DeliveriesPage implements OnInit {
  deliveries: Array<Delivery> = [];
  jsonData: any;
  isLoading: boolean = false;
  constructor(
    private deliveriesService: DeliveriesService,
    private router: Router,
    private statusService: StatusService
  ) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.deliveriesService.fetchDeliveries().subscribe((deliveries) => {
      this.deliveries = deliveries;
      this.jsonData = this.deliveries.slice(0, 10);
      this.isLoading = false;
    });
  }

  onDetail(deliveryId: number, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate([`/private/tabs/transports/detail-delivery/${deliveryId}`]);
  }

  getStatus(statusKey: string){
    return this.statusService.getStatus(statusKey);
  }

  getDate(delivery: Array<any>, source:string) {
    return this.deliveriesService.getDatePostcode(delivery, source)
  }

}
