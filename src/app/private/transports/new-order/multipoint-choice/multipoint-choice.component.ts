import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { TransportOrderService } from 'src/app/services/transport-order.service';

@Component({
    selector: 'app-multipoint-choice-component',
    templateUrl: './multipoint-choice.component.html',
    styleUrls: ['./multipoint-choice.component.scss'],
    standalone: false
})
export class MultipointChoiceComponent  implements OnInit {


  constructor(
    public transportOrderService: TransportOrderService,
    public config: ConfigService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter () {
    if (!this.transportOrderService?.type) {
      this.router.navigateByUrl ('/private/tabs/home', { replaceUrl: true });
    }
  }

  setMultipoint (isMultipoint: boolean) {
    if (this.transportOrderService.isMultipoint !== isMultipoint) {
      this.transportOrderService.deliveries = [];
    }

    this.transportOrderService.isMultipoint = isMultipoint;

    this.router.navigateByUrl('/private/tabs/transports/new-order/deliveries');
  }
}
