import { Component, ViewChild } from '@angular/core';
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
export class DeliveriesPage {
  deliveries: Array<Delivery> = [];
  jsonData: Array<Delivery> = [];
  isLoading: boolean = false;
  startIndex: number = 0;
  noFilter = false;
  statusValue:string = 'all';
  segmentValue:string = "all"
  isManualReload:boolean = false;
  @ViewChild('infiniteScroll') infiniteScroll: IonInfiniteScroll;
  @ViewChild('filter') filter: IonSegment;
  constructor(
    public deliveriesService: DeliveriesService,
    private router: Router,
    private statusService: StatusService,
    private loadingController: LoadingController,
    
  ) { }

  async ionViewWillEnter() {

    await this.loadData();
    

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
    const currentFilter = status && status.detail ? status.detail.value || status : status;
    this.deliveriesService.setFiltre(currentFilter);

    if (currentFilter === 'all') {
      this.jsonData = this.deliveries;
      this.filter.value = 'all';
    } else {
      this.jsonData = this.deliveries.filter(delivery => delivery.global_status === currentFilter);
    }
  }


  async loadData(){
    this.deliveriesService.filtre$.pipe(take(1)).subscribe((filter) => {
      this.filter.value = filter || 'all';
    }) ;

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
      this.deliveriesService.resetDeliveries();

      this.deliveriesService.fetchDeliveries().subscribe((deliveries) => {
        this.deliveries = deliveries;
        this.jsonData = deliveries;
        this.filterChanged(this.filter.value);
        loading.dismiss();
        this.isManualReload = false;
      });

    } else {
        this.filterChanged(this.filter.value);
        this.isLoading = false;
        loading.dismiss();
    }

  }

  handleRefresh(event:any) {
    this.isManualReload = true;
    setTimeout(() => {
      this.jsonData = [];
      this.deliveriesService.resetDeliveries();
      this.loadData();
      event.target.complete(() => {
        alert("ok ok");
      });
    }, 2000);
  }

}
