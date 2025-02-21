import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { TransportOrderService } from 'src/app/services/transport-order.service';

@Component({
    selector: 'app-new-order',
    templateUrl: './new-order.page.html',
    styleUrls: ['./new-order.page.scss'],
    standalone: false
})
export class NewOrderPage implements OnInit {
  drafts: any;
  draftsName: string[] = [];

  constructor(
    public config: ConfigService,
    public transportOrderService: TransportOrderService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }
}
