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
  jsonData: any;
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
    this.isLoading = true;
    this.deliveriesService.fetchDeliveries().subscribe((deliveries) => {
      this.deliveries = deliveries;
      this.jsonData = this.deliveries.slice(0, 10);
      this.isLoading = false;

      console.log('deliveries:',  deliveries);
    });
    this.filter.value = 'all';
  }

  onDetail(deliveryId: number, slidingItem: IonItemSliding) {
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
    if (this.startIndex === 0) {
      this.startIndex += 10;
    }

    const nextDeliveries = this.deliveries.slice(this.startIndex, this.startIndex + 10);

    if (nextDeliveries.length > 0) {
      this.jsonData.push(...nextDeliveries);
      this.startIndex += 10;
    } else {
      event.target.disabled = true; // Désactiver le chargement supplémentaire s'il n'y a plus d'adresses
    }

    event.target.complete(); // Indiquer que le chargement est terminé
  }

  filterChanged(status: any) {
    this.startIndex = 0;
    const statusValue = status.detail.value;
    let filteredDeliveries: Array<Delivery>;

    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    if (statusValue === 'all') {
      filteredDeliveries = this.deliveries.slice(0, this.startIndex + 10);
    } else {
      filteredDeliveries = this.deliveries.filter((item) => {
        return item.global_status.toLowerCase().includes(statusValue.toLowerCase());
      });
      filteredDeliveries = filteredDeliveries.slice(0, 10);
    }
    this.jsonData = filteredDeliveries;
    this.noFilter = filteredDeliveries.length === 0;
  }

}
