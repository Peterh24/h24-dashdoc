import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { TransportService } from 'src/app/services/transport.service';

@Component({
  selector: 'app-multipoint-choice-component',
  templateUrl: './multipoint-choice.component.html',
  styleUrls: ['./multipoint-choice.component.scss'],
})
export class MultipointChoiceComponent  implements OnInit {


  constructor(
    public transportService: TransportService,
    public config: ConfigService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter () {
    if (!this.transportService.type) {
      this.router.navigateByUrl ('/private/tabs/transports/new-order');  
    }
  }

  setMultipoint (isMultipoint: boolean) {
    if (this.transportService.isMultipoint !== isMultipoint) {
      this.transportService.deliveries = [];
    }

    this.transportService.isMultipoint = isMultipoint;

    this.router.navigateByUrl('/private/tabs/transports/new-order/deliveries');
  }
}
