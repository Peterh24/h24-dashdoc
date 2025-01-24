import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonAccordionGroup, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Subscription } from 'rxjs';
import { ApiTransportService } from 'src/app/services/api-transport.service';
import { DASHDOC_COMPANY, TRANSPORTS_DRAFTS_KEY } from 'src/app/services/constants';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { TransportService } from 'src/app/services/transport.service';

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.page.html',
  styleUrls: ['../basket/basket.page.scss', './deliveries.page.scss'],
})
export class DeliveriesPage implements OnInit, AfterViewInit {
  tab: number = 1;
  deliveries: any[] = [];
  deliveries1: number;
  drafts: any;
  draftsName: string[];
  subscription: Subscription;

  @ViewChild('accordionGroup') accordionGroup: IonAccordionGroup;

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

  constructor(
    public deliveriesService: DeliveriesService,
    public transportService: TransportService,
    public apiTransport: ApiTransportService,
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

  setTab (tab: number) {
    this.tab = tab;
    this.loadDeliveries ();
  }

  async loadDeliveries () {
    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: '<div class="h24loader"></div>',
      spinner: null,
    });

    await loading.present();
    this.deliveriesService.resetDeliveries();

//    const status = this.tab === 1 ? 'sent_to_trucker,on_loading_site,loading_complete,on_unloading_site,unloading_complete' : 'invoiced,paid,cancelled,done';
    const status: any = this.tab === 1 ? 'created,updated,confirmed,declined,verified,trucker,on_loading_site,loading_complete,on_unloading_site,unloading_complete' : null;

    this.subscription = this.deliveriesService.fetchDeliveries(status).subscribe({
      next: (deliveries) => {
        deliveries.forEach ((delivery: any) => {
          delivery.deliveries = this.transportService.loadDeliveries(delivery.deliveries);
        });
        this.deliveries = deliveries;
        if (this.tab === 1) {
          this.deliveries1 = deliveries.length;
        }
      },
      error: (error) => {
        this.deliveries = [];
      }
    });

    this.subscription.add(() => {
      this.subscription = null;
      loading.dismiss ();
    })
  }

  loadMoreDeliveries(event: any) {
    this.deliveriesService.fetchDeliveries().subscribe((additionalDeliveries) => {
      additionalDeliveries.forEach ((delivery: any) => {
        delivery.deliveries = this.transportService.loadDeliveries(delivery.deliveries);
      });
      this.deliveries = this.deliveries.concat(additionalDeliveries);
      event.target.complete();
    });
  }

  loadDrafts () {
    this.storage.get(DASHDOC_COMPANY).then ((pk) => {
      this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${pk}`).then ((drafts) => {
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

  getDefaultDeliveryName (delivery: any) {
    if (!delivery.created) {
      return "Demande";
    }

    return "Demande du " + this.getDateDay (delivery.created);
  }

  getHeaderDay (date: string) {
    return date ? 'Du ' + this.getDateDay (date) : '';
  }

  getAllDeliveries (deliveries: any) {
    const all: any = [];

    deliveries?.forEach ((delivery: any) => {
      if (delivery.origin?.address) {
        all.push (delivery.origin);
      }

      if (delivery.destination?.address) {
        all.push (delivery.destination);
      }
    });

    if (all.length) {
      all[0].title = 'De';
      all[all.length - 1].title = 'À'
    }

    return all;
  }

  getOrigin (delivery: any) {
    return delivery.deliveries?.[0]?.origin;
  }

  getDestination (delivery: any) {
    const destinations = delivery?.deliveries?.length;
    return destinations ? delivery.deliveries[destinations - 1]?.destination : {};
  }

  getOriginDate (delivery: any) {
    const origin = this.getOrigin(delivery);
    if (!origin) {
      return '';
    }

    return this.getDateDay(origin?.slots?.[0]?.start);
  }

  getDestinationDate (delivery: any) {
    const destination = this.getDestination(delivery);
    if (!destination) {
      return '';
    }

    return this.getDateDay(destination?.slots?.[0]?.start);
  }

  getAllPlannedLoads (delivery: any) {
    const merchandises: any = {};

    delivery.deliveries.map ((d: any) => d.planned_loads).forEach ((loads: any) => {
      loads?.forEach ((load: any) => { 
        merchandises[load.description] = true;
      })
    });

    return Object.keys (merchandises).sort ((a, b) => a.localeCompare (b)).join (',');
  }

  getContacts (delivery: any) {
    const contacts: any = {};

    delivery.deliveries?.map((c: any)=> c.tracking_contacts).flat().forEach ((contact: any) => {
      contacts[contact?.contact?.email] = contact;
    });

    return Object.values(contacts).map ((c: any) => c?.contact?.first_name + " " + c?.contact?.last_name)
      .join (", ");
  }

  getStatusIndex (delivery: any) {
    const statuses = delivery.statuses;

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
      switch (delivery.status) {
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

    this.storage.get(DASHDOC_COMPANY).then ((pk) => {
      this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${pk}`).then ((drafts) => {
        if (drafts) {
          delete drafts[draftName];
        }
        this.storage.set (`${TRANSPORTS_DRAFTS_KEY}_${pk}`, drafts).then (() => this.loadDrafts ());
      })
    });
  }

  gotoDraft (draftName: string) {
    this.transportService.loadTransport (this.drafts[draftName]);
    this.transportService.draftName = draftName;
    this.router.navigateByUrl ('/private/tabs/transports/new-order/summary');
  }
}
