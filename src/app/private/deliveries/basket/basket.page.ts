import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonAccordionGroup, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { DASHDOC_COMPANY, TRANSPORTS_DRAFTS_KEY } from 'src/app/services/constants';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { TransportService } from 'src/app/services/transport.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.page.html',
  styleUrls: ['./basket.page.scss'],
})
export class BasketPage implements OnInit, AfterViewInit {
  tab: number = 1;
  deliveries: any[] = [];
  drafts: any;
  draftsName: string[];

  typeName: any = {
    audiovisual: 'Audio visuel',
    charter: 'Affrètement',
    air: 'Aérien'
  };

  statuses: any = {
    created: 'Crée',
    confirmed: 'Confirmé',
    declined: 'Refusé', 
    invoiced: 'Facturé',
    paid: 'Payé',
    cancelled: 'Annulé',
    updated: 'Mis à jour',
    done: 'Terminé'
  };

  @ViewChild('accordionGroup') accordionGroup: IonAccordionGroup;
  @ViewChild('accordionDraftGroup') accordionDraftGroup: IonAccordionGroup;

  constructor(
    public deliveriesService: DeliveriesService,
    public transportService: TransportService,
    private router: Router,
    private loadingController: LoadingController,
    private storage: Storage,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    if (this.accordionGroup) {
      this.accordionGroup.value = 'a0';
    }
  }

  ionViewWillEnter () {
    this.loadDeliveries ();
    this.loadDrafts ();
  }

  setTab (tab: number) {
    this.tab = tab;
  }

  async loadDeliveries () {
    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: '<div class="h24loader"></div>',
      spinner: null,
    });

    await loading.present();
    this.deliveriesService.resetDeliveries();

    this.deliveriesService.fetchDeliveries('created,updated,confirmed,declined,verified').subscribe({
      next: (deliveries) => {
        this.deliveries = deliveries;
        loading.dismiss();
      },
      error: (error) => {
        this.deliveries = [];
        loading.dismiss ();
      }
    });
  }

  loadMoreDeliveries(event: any) {
    this.deliveriesService.fetchDeliveries().subscribe((additionalDeliveries) => {
      this.deliveries = this.deliveries.concat(additionalDeliveries);
      event.target.complete();
    });
  }

  loadDrafts () {
    this.storage.get(DASHDOC_COMPANY).then ((pk) => {
      this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${pk}`).then ((drafts) => {
        this.drafts = drafts || [];
        this.draftsName = Object.keys (this.drafts);
      });
    });
  }

  getDefaultDeliveryName (delivery: any) {
    if (!delivery.created) {
      return "Demande";
    }

    return "Demande du " + new Date (delivery.created).toLocaleDateString (navigator.languages?.[0] || 'fr')
  }

  getOrigin (delivery: any) {
    return delivery.deliveries?.[0]?.origin;
  }

  getDestination (delivery: any) {
    const destinations = delivery?.deliveries?.length;
    return destinations ? delivery.deliveries[destinations - 1]?.destination : {};
  }

  getAllPlannedLoads (delivery: any) {
    const merchandises: any = {};

    delivery.deliveries.map ((d: any) => d.loads).forEach ((loads: any) => {
      loads?.forEach ((load: any) => { 
        merchandises[load.description] = true;
      })
    });

    return Object.keys (merchandises).sort ((a, b) => a.localeCompare (b)).join (',');
  }

  onDraftDeleteRequest () {
    document.getElementById ("draft-delete").click ();
  }

  onDraftDelete (draftName: string, modal: any) {
    modal.dismiss ();
    const index = this.accordionDraftGroup?.value;
    
    if (index) {
      const draftName = this.draftsName[parseInt(new String(index).substring (1))];
      this.storage.get(DASHDOC_COMPANY).then ((pk) => {
        this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${pk}`).then ((drafts) => {
          if (drafts) {
            delete drafts[draftName];
          }
          this.storage.set (`${TRANSPORTS_DRAFTS_KEY}_${pk}`, drafts).then (() => this.loadDrafts ());
        })
      });
    }
  }

  gotoDraft (draftName: string) {
    this.transportService.loadTransport (this.drafts[draftName]);
    this.transportService.draftName = draftName;
    this.router.navigateByUrl ('/private/tabs/transports/new-order/summary');
  }
}
