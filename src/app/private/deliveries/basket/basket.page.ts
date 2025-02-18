import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonAccordionGroup, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Subscription } from 'rxjs';
import { ApiTransportService } from 'src/app/services/api-transport.service';
import { ConfigService } from 'src/app/services/config.service';
import { DASHDOC_COMPANY, TRANSPORTS_DRAFTS_KEY } from 'src/app/services/constants';
import { TransportOrderService } from 'src/app/services/transport-order.service';
import { TransportService } from 'src/app/services/transport.service';
import { Contact, Delivery, Load, Transport } from '../../models/transport.model';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.page.html',
  styleUrls: ['./basket.page.scss'],
})
export class BasketPage implements OnInit, AfterViewInit {
  tab: number = 1;
  transports: Transport[] = [];
  drafts: any;
  draftsName: string[];
  subscription: Subscription;

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
    public transportService: TransportService,
    public transport: TransportOrderService,
    public apiTransport: ApiTransportService,
    public config: ConfigService,
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
    this.tab = 1;
    this.loadTransports ();
    this.loadDrafts ();
  }

  ionViewWillLeave () {
    if (this.subscription) {
      this.subscription.unsubscribe ();
      this.subscription = null;
    }
  }

  handleRefresh(event: CustomEvent) {
    this.ionViewWillEnter ();
    (event.target as HTMLIonRefresherElement).complete();
  }

  setTab (tab: number) {
    this.tab = tab;
  }

  async loadTransports () {
    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: '<div class="h24loader"></div>',
      spinner: null,
    });

    await loading.present();
    this.transportService.resetTransports();

    this.subscription = this.transportService.fetchTransports('created,updated,confirmed,verified').subscribe({
      next: (transports) => {
        this.transports = transports;
      },
      error: (error) => {
        this.transports = [];
      },
    });

    this.subscription.add(() => {
      this.subscription = null;
      loading.dismiss ();
    })
  }

  loadMoreTransports(event: any) {
    this.transportService.fetchTransports().subscribe((additionalTransports) => {
      this.transports = this.transports.concat(additionalTransports);
      event.target.complete();
    });
  }

  loadDrafts () {
    this.storage.get(DASHDOC_COMPANY).then ((id) => {
      this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${id}`).then ((drafts) => {
        this.drafts = drafts || [];
        this.draftsName = Object.keys (this.drafts);
      });
    });
  }

  getDateDay (date: string) {
    return new Date (date).toLocaleDateString (navigator.languages?.[0] || 'fr');
  }

  getDefaultDeliveryName (delivery: any) {
    return "Demande";
    /*
    if (!delivery.created) {
      return "Demande";
    }

    return "Demande du " + this.getDateDay (delivery.created);

    */
  }

  getHeaderDay (date: string) {
    return date ? this.getDateDay (date) : '';
  }

  getOrigin (transport: Transport) {
    return transport.deliveries?.[0]?.origin;
  }

  getDestination (transport: Transport) {
    const destinations = transport?.deliveries?.length;
    return destinations ? transport.deliveries[destinations - 1]?.destination : null;
  }

  getAllPlannedLoads (transport: Transport) {
    const merchandises: any = {};

    transport.deliveries.map ((d: Delivery) => d.planned_loads).forEach ((loads: Load[]) => {
      loads?.forEach ((load: Load) => {
        merchandises[load.description] = true;
      })
    });

    return Object.keys (merchandises).sort ((a, b) => a.localeCompare (b)).join (',');
  }

  getContacts (transport: Transport) {
    const emails: any = {};

    transport.deliveries?.map((c: Delivery)=> c.tracking_contacts).forEach ((contacts: Contact[]) => {
      contacts.forEach ((contact) => {
        emails[contact?.email] = contact;
      });
    });

    return Object.values(emails).map ((c: any) => c?.first_name + " " + c?.last_name)
      .join (", ");
  }

  onDraftDeleteRequest () {
    document.getElementById ("draft-delete").click ();
  }

  onDraftDelete (draftName: string, modal: any) {
    modal.dismiss ();
    const index = this.accordionDraftGroup?.value;

    if (index) {
      const draftName = this.draftsName[parseInt(new String(index).substring (1))];
      this.storage.get(DASHDOC_COMPANY).then ((id) => {
        this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${id}`).then ((drafts) => {
          if (drafts) {
            delete drafts[draftName];
          }
          this.storage.set (`${TRANSPORTS_DRAFTS_KEY}_${id}`, drafts).then (() => this.loadDrafts ());
        })
      });
    }
  }

  gotoTransportDetail (transport: Transport) {
    if (transport?.id) {
      this.router.navigateByUrl ('/private/tabs/transports/detail/' + transport.id);
    }
  }

  gotoDraft (draftName: string) {
    this.transportService.loadDraft (draftName, this.drafts[draftName]);
    this.router.navigateByUrl ('/private/tabs/transports/new-order/deliveries');
  }
}
