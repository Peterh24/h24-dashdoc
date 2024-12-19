import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TransportService } from 'src/app/services/transport.service';

@Component({
  selector: 'app-multipoint-choice',
  templateUrl: './multipoint-choice.page.html',
  styleUrls: ['./multipoint-choice.page.scss'],
})
export class MultipointChoicePage implements OnInit {

  constructor(
    private transportService: TransportService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter () {
    if (!this.transportService.type) {
      this.router.navigateByUrl ('/private/tabs/transports/new-order');  
    }
  }

  setMultipoint (isMultipoint: boolean) {
    this.transportService.isMultipoint = isMultipoint;
    this.router.navigateByUrl('/private/tabs/transports/new-order/deliveries');
  }
}
