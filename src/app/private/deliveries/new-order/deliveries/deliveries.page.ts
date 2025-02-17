import { Component, OnInit } from '@angular/core';
import { DeliveryPage } from '../delivery/delivery.page';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';
import { NewOrderCommon } from '../new-order-common';
import { TransportOrderService } from 'src/app/services/transport-order.service';

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.page.html',
  styleUrls: ['./deliveries.page.scss'],
})
export class DeliveriesPage implements OnInit {
  origins: any[];
  destinations: any[];
  currentDelivery: any;
  isMultipointAuto: boolean;

  isModalOpen: boolean;
  showSummaryComponent = false;

  errors: any[] = [];
  common = new NewOrderCommon ();

  constructor(
    public transportOrderService: TransportOrderService,
    public config: ConfigService,
    private router: Router,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }


  ionViewWillEnter() {
    if (!this.transportOrderService?.type) {
      this.router.navigateByUrl ('/private/tabs/transports/new-order');
      return;
    }

    this.currentDelivery = null;
    this.isMultipointAuto = this.transportOrderService.isMultipoint === null;
    this.showSummaryComponent = this.config.isDesktop && this.transportOrderService.deliveries?.length > 0;
    this.errors = [];

    this.synchronize ();

    window.addEventListener('popstate', (event) => {
      if (this.isModalOpen) {
        event.preventDefault ();
        event.stopPropagation ();
        event.stopImmediatePropagation ();

        this.modalController.getTop ().then ((m) => m.dismiss ());
      }
    }, { capture: true });
  }

  /*
  @HostListener('window:popstate', ['$event'])
  onPopState(event: Event) {
    if (this.isModalOpen) {
      event.preventDefault ();
      event.stopPropagation ();
      event.stopImmediatePropagation ();

      this.modalController.getTop ().then ((m) => m.dismiss ());
    }
  }
  */

  async showAddDelivery (delivery: any = null, deliveryType: string = null)  {
    this.showSummaryComponent = false;

    const defaultContacts = this.transportOrderService?.deliveries?.[0]?.tracking_contacts;

    this.currentDelivery = {
      isModal: true,
      delivery,
      defaultContacts,
      deliveryType: this.isMultipointAuto ? null : deliveryType,
      originMaxSlot: this.getOriginsMaxSlot (this.transportOrderService.getOrigins ()),
      destinationMinSlot: this.getDestinationsMinSlot (this.transportOrderService.getDestinations ())
    };

    if (this.config.isMobile) {
      const modal = await this.modalController.create({
        component: DeliveryPage,
        componentProps: this.currentDelivery,
        cssClass: 'custom-big',
      });

      this.isModalOpen = true;
      modal.present();
      const { data } = await modal.onWillDismiss();
      this.isModalOpen = false;
      if (!data) {
        return;
      }

      if (delivery) {
        /* edit delivery */
      } else {
        this.addDelivery (data);
      }
    }
  }

  addDelivery (delivery: any) {
    if (this.transportOrderService.isMultipoint) {
      if (! this.currentDelivery.delivery) {
        this.transportOrderService.deliveries.push (delivery);
      }
    } else {
      if (! this.currentDelivery.delivery) {
        this.transportOrderService.deliveries.push (delivery);
      }

      const origins = this.transportOrderService.getOrigins ().length;
      const destinations = this.transportOrderService.getDestinations ().length;

      if (this.isMultipointAuto && origins == 2 && destinations == 2) {
        this.transportOrderService.isMultipoint = true;

        const origins = this.transportOrderService.getOrigins ();
        const destinations = this.transportOrderService.getDestinations ();

        origins[0].destination = destinations[0].destination;
        origins[1].destination = destinations[1].destination;

        this.transportOrderService.deliveries = origins;
      }

      if (origins > 2 && destinations <= 1 || origins <= 1 && destinations > 2) {
        this.transportOrderService.isMultipoint = false;
        this.isMultipointAuto = false;
      }
    }

    this.currentDelivery = null;

    this.synchronize ();
    this.validateForm ();

    console.log ('add', this.origins, this.destinations, delivery);
  }

  deleteDelivery (type: string, delivery: any) {
    if (type === 'origin') {
      this.transportOrderService.deliveries = this.transportOrderService.deliveries.filter ((d) => d !== delivery);
    }

    if (type === 'destination') {
      this.transportOrderService.deliveries = this.transportOrderService.deliveries.filter ((d) => d !== delivery);
    }

    if (this.isMultipointAuto) {
      this.transportOrderService.isMultipoint = this.transportOrderService.getOrigins().length >= 2 && this.transportOrderService.getDestinations ().length >= 2;
    }

    this.currentDelivery = null;

    this.synchronize ();
    this.validateForm ();
  }

  addOriginDisabled () {
    return !this.isMultipointAuto && this.transportOrderService.getOrigins ().length && this.transportOrderService.getDestinations ().length > 1;
  }

  addDestinationDisabled () {
    return !this.isMultipointAuto && this.transportOrderService.getDestinations ().length && this.transportOrderService.getOrigins ().length > 1;
  }

  getOriginsMaxSlot (origins: any[]) {
    if (!origins?.length) {
      return null;
    }
    const dates = origins.filter ((o) => o?.origin?.slots?.[0]?.start)?.map ((o) => new Date(o?.origin?.slots?.[0]?.start).valueOf ());
    const max = Math.max (...dates);
    return isFinite (max) ? new Date(max).toISOString () : null;
  }

  getDestinationsMinSlot (destinations: any[]) {
    if (!destinations?.length) {
      return null;
    }
    const dates = destinations.filter ((d) => d?.destination?.slots?.[0]?.start)?.map ((d) => new Date(d?.destination?.slots?.[0]?.start).valueOf ());
    const min = Math.min (...dates);
    return isFinite(min) ? new Date(min).toISOString () : null
  }

  synchronize () {
    this.transportOrderService.sortDeliveries ();

    this.origins = this.transportOrderService.getOrigins ();
    this.destinations = this.transportOrderService.getDestinations ();
  }

  setShowSummaryComponent (value: boolean = true) {
    this.currentDelivery = null;
    this.showSummaryComponent = value;
  }

  getTransportErrors () {
    return this.common.getTransportErrors (this.transportOrderService);
  }

  getDeliveryErrors (delivery: any, type: string = null) {
    return this.common.getDeliveryErrors (this.transportOrderService, delivery, type);
  }

  hasErrors () {
    return Object.keys(this.errors).length;
  }

  validateForm () {
    this.errors = this.common.getTransportErrors (this.transportOrderService);
  }

  onSubmit () {
    this.validateForm ();

    /*
    if (this.hasErrors ()) {
      return;
    }
    */

    if (this.config.isMobile) {
      this.router.navigateByUrl('/private/tabs/transports/new-order/summary');
    } else {
      this.showSummaryComponent = true;
    }
  }
}
