import { Component, HostListener, OnInit } from '@angular/core';
import { TransportService } from 'src/app/services/transport.service';
import { DeliveryPage } from '../delivery/delivery.page';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.page.html',
  styleUrls: ['./deliveries.page.scss'],
})
export class DeliveriesPage implements OnInit {
  origins: any[];
  destinations: any[];
  isMultipointAuto: boolean;

  isModalOpen: boolean;

  constructor(
    public transport: TransportService,
    private router: Router,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }


  ionViewWillEnter() {
    if (!this.transport.type) {
      this.router.navigateByUrl ('/private/tabs/transports/new-order');  
    }

    this.isMultipointAuto = this.transport.isMultipoint === null;
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

  initializeTransport () {
    this.transport.isMultipoint = false;
    this.transport.isEditMode = false;
    this.transport.deliveries = [];
    this.transport.segments = [];
    this.transport.trailers = [];
    this.transport.vehicle = {};
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

  async addDelivery (delivery: any = null, deliveryType: string = null)  {
    const modal = await this.modalController.create({
      component: DeliveryPage,
      componentProps: {
        delivery: delivery,
        deliveryType: this.isMultipointAuto ? null : deliveryType,
        originMaxSlot: this.getOriginsMaxSlot (this.transport.getOrigins ()),
        destinationMinSlot: this.getDestinationsMinSlot (this.transport.getDestinations ())
      },
      cssClass: 'delivery-modal',
    });

    this.isModalOpen = true;
    modal.present();
    const { data } = await modal.onWillDismiss();
    this.isModalOpen = false;
    if (!data) {
      return;
    }

    if (delivery !== null) {
      /* edit delivery */
    } else if (this.transport.isMultipoint) {
      this.transport.deliveries.push (data);
    } else {
      if (data.destination) {
        if (!this.transport.deliveries.find ((d) => d.destination?.address?.pk === data.destination?.address?.pk)) {
          this.transport.deliveries.push ({ destination: data.destination });
        }
        delete data.destination;
      }

      if (data.origin) {
        if (!this.transport.deliveries.find ((d) => d.origin?.address?.pk === data.origin?.address?.pk)) {
          this.transport.deliveries.push (data);
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

    this.synchronize ();

    console.log ('add', this.origins, this.destinations, data);
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

  onSubmit () {
    this.router.navigateByUrl('/private/tabs/transports/new-order/summary');
  }
}
