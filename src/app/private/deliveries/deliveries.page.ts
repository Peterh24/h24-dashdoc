import { Component, OnInit, ViewChild } from '@angular/core';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { Delivery } from './delivery.model';
import { IonInfiniteScroll, IonItemSliding, IonSegment, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StatusService } from 'src/app/utils/services/status.service';
import { take } from 'rxjs';

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
  statusValue:string = 'all';
  segmentValue:string = "all"
  @ViewChild('infiniteScroll') infiniteScroll: IonInfiniteScroll;
  @ViewChild('filter') filter: IonSegment;
  constructor(
    public deliveriesService: DeliveriesService,
    private router: Router,
    private statusService: StatusService,
    private loadingController: LoadingController,
    
  ) { }

  ngOnInit() {

  }

  async ionViewWillEnter() {
    this.deliveriesService.deliveries.pipe(take(1)).subscribe((data) => {
      if(data.length == 0){
        this.deliveries = [];
        this.jsonData = [];
      }
    });
    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: '<div class="h24loader"></div>',
      spinner: null,
    })
    await loading.present();
    if(this.jsonData.length === 0){
      this.deliveriesService.fetchDeliveries().subscribe((deliveries) => {
        loading.dismiss();
        this.deliveries = deliveries;
        this.jsonData = deliveries;
      });

    } else {
        loading.dismiss();
    }

    this.filter.value = 'all';
  }

  onDetail(deliveryId: string, slidingItem: IonItemSliding) {
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
    this.statusValue = status.detail.value;
    let filteredDeliveries: Array<Delivery>;
    

    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }

    if (this.statusValue === 'all') {
      filteredDeliveries = this.deliveries.slice();
    } else {
      filteredDeliveries = this.deliveries.filter((item) => {
        return item.global_status.toLowerCase().includes(this.statusValue.toLowerCase());
      })
    }
    this.jsonData = filteredDeliveries;

    this.noFilter = filteredDeliveries.length === 0;
    this.segmentValue = this.statusValue;
  }

}
