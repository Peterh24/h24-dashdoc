import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { AuthService } from 'src/app/services/auth.service';
import { ConfigService } from 'src/app/services/config.service';
import { DASHDOC_COMPANY, TRANSPORTS_DRAFTS_KEY } from 'src/app/services/constants';
import { TransportOrderService } from 'src/app/services/transport-order.service';
import { TransportService } from 'src/app/services/transport.service';

@Component({
  selector: 'app-type-choice-component',
  templateUrl: './type-choice.component.html',
  styleUrls: ['./type-choice.component.scss'],
})
export class TypeChoiceComponent  implements OnInit {
  drafts: any;
  draftsName: string[] = [];

  constructor(
    public transportOrderService: TransportOrderService,
    private transportService: TransportService,
    private authService: AuthService,
    private router: Router,
    private storage: Storage,
    public config: ConfigService
  ) { }

  ngOnInit() {}

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
    if (type == 'audiovisual') {
      this.transportOrderService.type = type;
      if (this.config.isMobile) {
        this.router.navigateByUrl ('/private/tabs/transports/new-order/vehicle-choice');
      }
    }
  }

  loadDraft (name: string) {
    /* TODO
    if (this.drafts[name]) {
      this.transportService.loadTransport (this.drafts[name]);
      this.transport.draftName = name;
      this.router.navigateByUrl ('/private/tabs/transports/new-order/summary');
    }
      */
  }
}
