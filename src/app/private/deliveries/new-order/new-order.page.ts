import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { TRANSPORTS_DRAFTS_KEY } from 'src/app/services/constants';
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
    private transportService: TransportService,
    private router: Router,
    private storage: Storage,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter () {
    this.draftsName = [];

    this.storage.get (TRANSPORTS_DRAFTS_KEY).then ((drafts) => {
      if (drafts) {
        this.drafts = drafts;
        this.draftsName = Object.keys (drafts);
      }
    })
  }

  setTransportType (type: string) {
    if (!this.transportService.type || this.transportService.type != type) {
      this.transportService.resetTransport ();
    }

    this.transportService.type = type;
    this.router.navigateByUrl ('/private/tabs/transports/new-order/vehicle-choice');
  }

  loadDraft (name: string) {
    if (this.drafts[name]) {
      this.transportService.loadTransport (this.drafts[name]);
      this.transportService.draftName = name;
      this.router.navigateByUrl ('/private/tabs/transports/new-order/summary');
    }
  }
}
