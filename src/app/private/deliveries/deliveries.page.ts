import { Component, OnInit, ViewChild } from '@angular/core';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { Delivery } from './delivery.model';
import { IonInfiniteScroll, IonItemSliding, IonSegment } from '@ionic/angular';
import { Router } from '@angular/router';
import { StatusService } from 'src/app/utils/services/status.service';

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.page.html',
  styleUrls: ['./deliveries.page.scss'],
})
export class DeliveriesPage implements OnInit {
  deliveries: Array<Delivery> = [];
  jsonData: Array<Delivery> = [];
  isLoading: boolean = false;
  startIndex: number = 0;
  noFilter: boolean;
  @ViewChild('infiniteScroll') infiniteScroll: IonInfiniteScroll;
  @ViewChild('filter') filter: IonSegment;
  constructor(
    private deliveriesService: DeliveriesService,
    private router: Router,
    private statusService: StatusService
  ) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.deliveriesService.resetDeliveries();
    this.deliveries = [];
    this.isLoading = true;
    this.deliveriesService.fetchDeliveries().subscribe((deliveries) => {
      this.deliveries = deliveries;
      this.jsonData = deliveries;
      this.isLoading = false;

    });
    this.filter.value = 'all';
  }

  onDetail(deliveryId: string, slidingItem: IonItemSliding) {
    console.log('deliveryId: ', deliveryId);
    slidingItem.close();
    this.router.navigate([`/private/tabs/transports/detail-delivery/${deliveryId}`]);
  }

  getStatus(statusKey: string){
    return this.statusService.getStatus(statusKey);
  }

  getDate(delivery: Array<any>, source:string) {
    return this.deliveriesService.getDatePostcode(delivery, source);
  }

  getAddress(delivery: Array<any>, source:string) {
    return this.deliveriesService.getAddress(delivery, source);
  }

  loadMoreData(event: any) {
    this.deliveriesService.fetchDeliveries().subscribe((additionalDeliveries) => {
      this.deliveries = this.deliveries.concat(additionalDeliveries);
      this.jsonData = this.deliveries;
      event.target.complete();
    });
  }

  filterChanged(status: any) {
    this.startIndex = 0;
    const statusValue = status.detail.value;
    let filteredDeliveries: Array<Delivery>;
    

    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }

    if (statusValue === 'all') {
      filteredDeliveries = this.deliveries.slice();
    } else {
      filteredDeliveries = this.deliveries.filter((item) => {
        return item.global_status.toLowerCase().includes(statusValue.toLowerCase());
      })
    }
    this.jsonData = filteredDeliveries;

    this.noFilter = filteredDeliveries.length === 0;

  }

}
