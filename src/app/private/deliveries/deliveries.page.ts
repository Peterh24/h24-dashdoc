import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonAccordionGroup, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Subscription } from 'rxjs';
import { ApiTransportService } from 'src/app/services/api-transport.service';
import { CompanyService } from 'src/app/services/company.service';
import { ConfigService } from 'src/app/services/config.service';
import { DASHDOC_COMPANY, TRANSPORTS_DRAFTS_KEY } from 'src/app/services/constants';
import { TransportOrderService } from 'src/app/services/transport-order.service';
import { TransportService } from 'src/app/services/transport.service';
import { Contact, Delivery, Transport } from '../models/transport.model';

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.page.html',
  styleUrls: ['basket/basket.page.scss', './deliveries.page.scss'],
})
export class DeliveriesPage implements OnInit, AfterViewInit {
  tab: number = 1;
  transports: Transport[] = [];
  transports1: number;
  drafts: any;
  draftsName: string[];
  subscription: Subscription;
  showResetTransport = false;

  @ViewChild('accordionGroup') accordionGroup: IonAccordionGroup;

  typeName: any = {
    audiovisual: 'Audio visuel',
    charter: 'Affrètement',
    air: 'Aérien'
  };

  statuses: any = {
    created: 'Crée',
    confirmed: 'Confirmé',
    assigned: 'Attribuée',
    declined: 'Refusé',
    verified: 'Vérifiée',
    send_to_trucker: 'Transporteur',
    acknowledged: 'Admis',
    on_loading_site: 'Chargement',
    loading_complete: 'Chargé',
    on_unloading_site: 'Déchargement',
    unloading_complete: 'Déchargé',
    invoiced: 'Facturé',
    paid: 'Payé',
    cancelled: 'Annulé',
    updated: 'Mis à jour',
    done: 'Terminé'
  };

  constructor(
    public transportService: TransportService,
    public companyService: CompanyService,
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
    this.loadDrafts ();
    this.setTab (1);
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
    this.loadTransports ();
  }

  async loadTransports () {
    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: '<div class="h24loader"></div>',
      spinner: null,
    });

    await loading.present();
    this.transportService.resetTransports();

//    const status = this.tab === 1 ? 'sent_to_trucker,on_loading_site,loading_complete,on_unloading_site,unloading_complete' : 'invoiced,paid,cancelled,done';
    const status: any = this.tab === 1 ? 'created,updated,confirmed,assigned,verified,send_to_trucker,acknowledged,on_loading_site,loading_complete,on_unloading_site,unloading_complete' : null;

    this.subscription = this.transportService.fetchTransports(status).subscribe({
      next: (transports) => {
        this.transports = transports;
        if (this.tab === 1) {
          this.transports1 = transports.length;
        }
      },
      error: (error) => {
        this.transports = [];
      }
    });

    this.subscription.add(() => {
      this.subscription = null;
      loading.dismiss ();
    })
  }

  loadMoreTransports(event: any) {
    this.transportService.fetchTransports().subscribe((additionalTranports) => {
      this.transports = this.transports.concat(additionalTranports);
      event.target.complete();
    });
  }

  loadDrafts () {
    this.storage.get(DASHDOC_COMPANY).then ((id) => {
      this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${id}`).then ((drafts) => {
        if (drafts) {
          this.drafts = drafts;
          this.draftsName = Object.keys (drafts);
        } else {
          drafts = {};
          this.draftsName = [];
        }
      });
    });
  }

  getDateDay (date: string) {
    if (!date) {
      return '';
    }

    return new Date (date).toLocaleDateString (navigator.languages?.[0] || 'fr');
  }

  getDefaultDeliveryName (transport: Transport) {
    return "Demande";
    /*
    if (!transport.created) {
      return "Demande";
    }

    return "Demande du " + this.getDateDay (transport.created);
    */
  }

  getHeaderDay (date: string) {
    return date ? this.getDateDay (date) : '';
  }

  getAllTransports (transport: Transport) {
    const all: any = [];
    const deliveries = this.transport.deliveries;

    deliveries?.forEach ((transport: Delivery) => {
      if (transport.origin?.address) {
        all.push (transport.origin);
      }

      if (transport.destination?.address) {
        all.push (transport.destination);
      }
    });

    if (all.length) {
      all[0].prefix = 'De';
      all[all.length - 1].prefix = 'À'
    }

    return all;
  }

  getOrigin (transport: Transport) {
    return transport.deliveries?.[0]?.origin;
  }

  getDestination (transport: Transport) {
    const destinations = transport?.deliveries?.length;
    return destinations ? transport.deliveries[destinations - 1]?.destination : null;
  }

  getOriginDate (transport: Transport) {
    const origin = this.getOrigin(transport);
    if (!origin) {
      return '';
    }

    return this.getDateDay(origin?.slots?.[0]?.start);
  }

  getDestinationDate (transport: Transport) {
    const destination = this.getDestination(transport);
    if (!destination) {
      return '';
    }

    return this.getDateDay(destination?.slots?.[0]?.start);
  }

  getAllPlannedLoads (transport: Transport) {
    const merchandises: any = {};

    transport.deliveries.map ((d: any) => d.planned_loads || d.loads).forEach ((loads: any) => {
      loads?.forEach ((load: any) => {
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

  getStatusIndex (transport: Transport) {
    const statuses = transport.statuses;

    if (Object.keys (statuses).length) {
      if (statuses.done) {
        return 3;
      } else if (statuses.trucker ||
          statuses.on_loading_site ||
          statuses.loading_complete ||
          statuses.on_unloading_site ||
          statuses.unloading_complete) {
            return 2;
      } else {
        return 1;
      }
    } else {
      switch (transport.status) {
        case 'created':
        case 'updated':
        case 'confirmed': {
          return 1;
        }
        case 'trucker':
        case 'on_loading_site':
        case 'loading_complete':
        case 'on_unloading_site':
        case 'unloading_complete': {
          return 2;
        }
        case 'invoiced':
        case 'done': {
          return 3;
        }
      }

      return 1;
    }
  }

  onDraftDelete (draftName: string, modal: any) {
    modal.dismiss ();

    this.storage.get(DASHDOC_COMPANY).then ((id) => {
      this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${id}`).then ((drafts) => {
        if (drafts) {
          delete drafts[draftName];
        }
        this.storage.set (`${TRANSPORTS_DRAFTS_KEY}_${id}`, drafts).then (() => this.loadDrafts ());
      })
    });
  }

  gotoTransportDetail (transport: Transport) {
    console.log (transport);
    if (transport?.id) {
      this.router.navigateByUrl ('/private/tabs/transports/detail/' + transport.id);
    }
  }

  setShowResetTransport (value = true) {
    this.showResetTransport = value;
  }

  setResetTransport (value: boolean, modal: any) {
    this.showResetTransport = false;
    modal.dismiss ();

    if (value) {
      this.transport.resetTransport ();
      this.router.navigateByUrl('/private/tabs/transports/new-order');
    } else {
      if (this.config.isDesktop) {
        if (this.transport.deliveries?.length) {
          this.router.navigateByUrl('/private/tabs/transports/new-order/deliveries');
        } else {
          this.router.navigateByUrl('/private/tabs/transports/new-order');
        }
      } else {
        if (this.transport.isMultipoint === true || this.transport.isMultipoint === false) {
          this.router.navigateByUrl ('/private/tabs/transports/new-order/deliveries')
        } else if (this.transport.vehicle) {
          this.router.navigateByUrl ('/private/tabs/transports/new-order/multipoint-choice');
        } else if (this.transport.type) {
          this.router.navigateByUrl('/private/tabs/transports/new-order/vehicle-choice');
        } else {
          this.router.navigateByUrl('/private/tabs/transports/new-order');
        }
      }
    }
  }
}
