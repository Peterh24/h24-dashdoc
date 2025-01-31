import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { TransportService } from 'src/app/services/transport.service';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.page.html',
  styleUrls: ['./new-order.page.scss'],
})
export class NewOrderPage implements OnInit {
  drafts: any;
  draftsName: string[] = [];

  constructor(
    public config: ConfigService,
    public transportService: TransportService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }
}
