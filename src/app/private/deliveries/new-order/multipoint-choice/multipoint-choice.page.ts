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
    public transport: TransportService,
    private router: Router,
  ) {

  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (!this.transport.type) {
      this.router.navigateByUrl ('/private/tabs/transports/new-order');
      return;
    }
  }
}
