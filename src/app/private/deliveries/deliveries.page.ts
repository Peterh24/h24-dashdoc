import { Component, OnInit } from '@angular/core';
import { DeliveriesService } from 'src/app/services/deliveries.service';

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.page.html',
  styleUrls: ['./deliveries.page.scss'],
})
export class DeliveriesPage implements OnInit {

  constructor(
    private deliveriesService: DeliveriesService,
  ) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.deliveriesService.fetchDeliveries().subscribe();
  }

}
