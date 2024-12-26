import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { AuthService } from 'src/app/services/auth.service';
import { DASHDOC_COMPANY, TRANSPORTS_DRAFTS_KEY } from 'src/app/services/constants';
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
    private authService: AuthService,
    private router: Router,
    private storage: Storage,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter () {
    this.draftsName = [];

    this.storage.get(DASHDOC_COMPANY).then ((pk) => {
      this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${pk}`).then ((drafts) => {
        if (drafts) {
          this.drafts = drafts;
          this.draftsName = Object.keys (drafts);
        }
      });
    });

    this.authService.loadCurrentUserDetail (this.authService.currentUser.id).subscribe ({
      next: (res) => { }
    });
  }

  setTransportType (type: string) {
    if (!this.transportService.type || this.transportService.type != type) {
      this.transportService.resetTransport ();
    }

    if (type == 'audiovisual') {
      this.transportService.type = type;
     this.router.navigateByUrl ('/private/tabs/transports/new-order/vehicle-choice');
    }
  }

  loadDraft (name: string) {
    if (this.drafts[name]) {
      this.transportService.loadTransport (this.drafts[name]);
      this.transportService.draftName = name;
      this.router.navigateByUrl ('/private/tabs/transports/new-order/summary');
    }
  }
}
