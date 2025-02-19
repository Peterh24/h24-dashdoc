import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TransportOrderService } from 'src/app/services/transport-order.service';

@Component({
  selector: 'app-multipoint-choice',
  templateUrl: './multipoint-choice.page.html',
  styleUrls: ['./multipoint-choice.page.scss'],
})
export class MultipointChoicePage implements OnInit {

  constructor(
    public transportOrderService: TransportOrderService,
    private router: Router,
  ) {

  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (!this.transportOrderService?.type) {
      this.router.navigateByUrl ('/private/tabs/transports/new-order');
      return;
    }
  }
}
