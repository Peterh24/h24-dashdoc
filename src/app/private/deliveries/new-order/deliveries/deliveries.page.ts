import { Component, HostListener, OnInit } from '@angular/core';
import { TransportService } from 'src/app/services/transport.service';
import { DeliveryPage } from '../delivery/delivery.page';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config.service';

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

  constructor(
    public transport: TransportService,
    public config: ConfigService,
    private router: Router,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }


  ionViewWillEnter() {
    if (!this.transport.type) {
      this.router.navigateByUrl ('/private/tabs/transports/new-order');
      return;
    }

    this.currentDelivery = null;
    this.isMultipointAuto = this.transport.isMultipoint === null;
    this.showSummaryComponent = this.transport.deliveries?.length > 0;

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

    const defaultContacts = this.transport?.deliveries?.[0]?.tracking_contacts;

    this.currentDelivery = {
      isModal: true,
      delivery,
      defaultContacts,
      deliveryType: this.isMultipointAuto ? null : deliveryType,
      originMaxSlot: this.getOriginsMaxSlot (this.transport.getOrigins ()),
      destinationMinSlot: this.getDestinationsMinSlot (this.transport.getDestinations ())
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
    if (this.transport.isMultipoint) {
      this.transport.deliveries.push (delivery);
    } else {
      if (delivery.destination) {
        if (!this.transport.deliveries.find ((d) => d.destination?.address?.pk === delivery.destination?.address?.pk)) {
          this.transport.deliveries.push (delivery);
        }
      } else if (delivery.origin) {
        if (!this.transport.deliveries.find ((d) => d.origin?.address?.pk === delivery.origin?.address?.pk)) {
          this.transport.deliveries.push (delivery);
        }
      }

      const origins = this.transport.getOrigins ().length;
      const destinations = this.transport.getDestinations ().length;

      if (this.isMultipointAuto && origins == 2 && destinations == 2) {
        this.transport.isMultipoint = true;

        const origins = this.transport.getOrigins ();
        const destinations = this.transport.getDestinations ();

        origins[0].destination = destinations[0].destination;
        origins[1].destination = destinations[1].destination;

        this.transport.deliveries = origins;
      }

      if (origins > 2 && destinations <= 1 || origins <= 1 && destinations > 2) {
        this.transport.isMultipoint = false;
        this.isMultipointAuto = false;
      }
    }

    this.currentDelivery = null;

    this.synchronize ();

    console.log ('add', this.origins, this.destinations, delivery);
  }

  deleteDelivery (type: string, delivery: any) {
    if (type === 'origin') {
      this.transport.deliveries = this.transport.deliveries.filter ((d) => !d.origin?.address || d.origin?.address?.pk != delivery?.origin?.address?.pk);
    }

    if (type === 'destination') {
      this.transport.deliveries = this.transport.deliveries.filter ((d) => !d.destination?.address || d.destination?.address?.pk != delivery?.destination?.address?.pk);
    }

    if (this.isMultipointAuto) {
      this.transport.isMultipoint = this.transport.getOrigins().length >= 2 && this.transport.getDestinations ().length >= 2;
    }

    this.synchronize ();
  }

  addOriginDisabled () {
    return !this.isMultipointAuto && this.transport.getOrigins ().length && this.transport.getDestinations ().length > 1;
  }

  addDestinationDisabled () {
    return !this.isMultipointAuto && this.transport.getDestinations ().length && this.transport.getOrigins ().length > 1;
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

  isSlotExceeded (date: string) {
    if (!date) {
      return false;
    }

    const day = new Date(date).toISOString ().split (/T/)[0];
    const now = new Date().toISOString ().split (/T/)[0];

    return new Date(day).valueOf() < new Date(now).valueOf ();
  }

  synchronize () {
    this.transport.sortDeliveries ();

    this.origins = this.transport.getOrigins ();
    this.destinations = this.transport.getDestinations ();
  }

  isMultipointDeliveryInvalid (index: number) {
    if (this.transport.isMultipoint) {
      const delivery = this.transport.deliveries[index];
      if (index > 0) {
        const previousDelivery = this.transport.deliveries[index -1];
        
        return new Date (delivery.origin?.slots?.[0]?.start) < 
          new Date (previousDelivery.destination?.slots?.[0]?.start);
      }
    }

    return false;
  }

  setShowSummaryComponent (value: boolean = true) {
    this.showSummaryComponent = value;
  }

  onSubmit () {
    if (this.config.isMobile) {
      this.router.navigateByUrl('/private/tabs/transports/new-order/summary');
    } else {
      this.showSummaryComponent = true;
    }
  }
}
