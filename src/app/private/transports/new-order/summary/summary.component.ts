import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { ApiTransportService } from 'src/app/services/api-transport.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConfigService } from 'src/app/services/config.service';
import { CURRENT_COMPANY, HTTP_REQUEST_UNKNOWN_ERROR, TRANSPORTS_DRAFTS_KEY } from 'src/app/services/constants';
import { NotificationsService } from 'src/app/services/notifications.service';
import { NewOrderCommon } from '../new-order-common';
import { TransportOrderService } from 'src/app/services/transport-order.service';
import { TransportService } from 'src/app/services/transport.service';
import { Contact, Delivery, Load, Slot, Transport } from 'src/app/private/models/transport.model';
import { IonModal } from '@ionic/angular/common';


@Component({
    selector: 'app-summary-component',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.scss'],
    standalone: false
})
export class SummaryComponent  implements OnInit {

  typeName: Record<string, string> = {
    audiovisual: 'Audiovisuel',
    charter: 'Affrètement',
    air: 'Aérien'
  };

  company: string;
  shipperReference: string;

  common = new NewOrderCommon ();

  constructor(
    public transportOrderService: TransportOrderService,
    public config: ConfigService,
    private authService: AuthService,
    private notifications: NotificationsService,
    private router: Router,
    private storage: Storage,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private transportService: TransportService,
    private apiTransport: ApiTransportService
  ) { }

  ngOnInit() {
    if (!this.transportOrderService.type) {
      this.router.navigateByUrl ('/private/tabs/home', { replaceUrl: true });
      return;
    }

    this.authService.loadCurrentUserDetail (this.authService.currentUser.id).subscribe ({
      next: (res) => { }
    });

    console.log ('summary', this.transportOrderService);
  }

  getContacts (contacts: Contact[]) {
    return contacts?.map ((c) => c.first_name + " " + c.last_name).join (", ");
  }

  getMerchandises (merchandises: Load[]) {
    if (!merchandises) {
      return '';
    }

    return merchandises.map ((m: Load) => m.description).sort ((a:string, b:string) => a.localeCompare (b)).join (', ');
  }

  formatSlot (slot: Slot) {
    const options: Record<string, string> = { weekday: 'long', day: '2-digit', month: 'long' };

    if (!slot?.start) {
      return "";
    }

    const day = '<b>' + new Date (slot.start).toLocaleString (navigator.languages?.[0] || 'fr', options) + '</b> ';

    if (slot.start && slot.end && slot.start != slot.end) {
      return day + ' entre ' + slot.start.split (/T/)[1]?.substr(0, 5) + ' et ' + slot.end.split (/T/)[1]?.substr(0, 5);
    } else {
      return day + ' à ' + slot.start.split (/T/)[1]?.substr(0, 5);
    }
  }

  editSection (type: string) {
    let url = null;

    if (this.config.isMobile) {
      const urls: Record<string, string> = {
        type: '/private/tabs/transports/new-order',
        vehicle: '/private/tabs/transports/new-order/vehicle-choice',
        origins: '/private/tabs/transports/new-order/deliveries',
        destinations: '/private/tabs/transports/new-order/deliveries'
      }

      url = urls[type];
    }

    if (this.config.isDesktop) {
      if (type == 'type' || type == 'vehicle') {
        url = '/private/tabs/transports/new-order';
      } else {
        url = '/private/tabs/transports/new-order/deliveries';
      }
    }

    if (url) {
      this.router.navigateByUrl (url);
    }
  }

  async onSubmit (deleteDraft = false) {
    const transport = await this.transportService.buildTransport (this.transportOrderService, this.shipperReference);
    const files: any[] = [];

    transport?.deliveries?.forEach ((delivery: Delivery, index: number) => {
      if (delivery?.origin?.file) {
        files.push ({
          file: delivery.origin.file,
          type: 'origin',
          delivery: index + 1
        });

        delete delivery.origin.file;
      }

      if (delivery?.destination?.file) {
        files.push ({
          file: delivery.destination.file,
          type: 'destination',
          delivery: index + 1
        });

        delete delivery.destination.file;
      }
    });

    let request;

    if (transport.id) {
      request = this.apiTransport.updateTransport (transport);
    } else {
      request = this.apiTransport.createTransport (transport);
    }

    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: '<div class="h24loader"></div>',
      spinner: null,
    });

    await loading.present();

    request.subscribe({
      next: async (res: any) => {
        loading.dismiss ();

        const transport = res;
        const errors = await this.uploadFiles (transport, files);

        if (errors?.length) {
          const alert = await this.alertController.create({
            header: `Erreur chargement de ${errors?.length} fichier(s)`,
            message: HTTP_REQUEST_UNKNOWN_ERROR,
            buttons: ['Compris'],
          });

          await alert.present();
          await alert.onDidDismiss ();
        }

        const confirm = await this.alertController.create({
          header: 'Bravo, votre course a été enregistrée',
          message: 'Votre course a été validée et nous est parvenue, en cas de besoin d\'informations complementaires, nous vous contacterons sur le numero de téléphone présent dans votre profil.',
          buttons: [
            {
              text: 'Compris',
              handler: () => {
              }
            }
          ],
        });

        await confirm.present();
        await confirm.onDidDismiss ();

        this.transportOrderService.resetTransport ();
        // On renouvelle le token firebase pour éviter qu'il n'expire bientot
        this.notifications.resetToken ();

        if (this.transportOrderService.draftName && deleteDraft) {
          this.storage.get(CURRENT_COMPANY).then ((id) => {
            this.storage.get (`${TRANSPORTS_DRAFTS_KEY}_${id}`).then ((drafts) => {
              delete drafts[this.transportOrderService.draftName];
              this.transportOrderService.draftName = null;
              this.storage.set (`${TRANSPORTS_DRAFTS_KEY}_${id}`, drafts);
            });
          });
        }

        this.router.navigateByUrl('/private/tabs/transports/basket').then (async () => {
        });
      },
      error: async (error: any) => {
        console.log (error);
        loading.dismiss ();

        const alert = await this.alertController.create({
          header: "Erreur",
          message: HTTP_REQUEST_UNKNOWN_ERROR,
          buttons: ['Compris'],
        });

        await alert.present();
      }
    });
  }

  async uploadFiles (transport: Transport, files: any[]) {
    const errors: any[] = [];

    files.forEach (async (file: any, index: any) => {
      if (file) {
        try {
          await firstValueFrom (this.apiTransport.createTransportMessage (transport, file.file, file.type, file.delivery));
        } catch (error) {
          errors.push (file.file.name);
        }
      }
    });

    return errors;
  }

  onSetOrderName (name: string | number, deleteDraft: boolean, modal: IonModal) {
    if (name) {
      modal.dismiss ();

      this.shipperReference = String(name);
      this.onSubmit (deleteDraft);
    }
  }

  async onSetDraftName (name: string | number, modal: IonModal) {
    if (name) {
      modal.dismiss ();

      const transport = await this.transportService.buildTransport (this.transportOrderService);
      transport.isMultipoint = this.transportOrderService.isMultipoint;
      this.transportService.saveDraft (String(name), transport);
    }
  }

  getTransportErrors () {
    return this.common.getTransportErrors (this.transportOrderService);
  }

  getDeliveryErrors (delivery: Delivery, type: string = null) {
    return this.common.getDeliveryErrors (this.transportOrderService, delivery, type);
  }

  hasErrors () {
    const transportErrors = this.common.getTransportErrors (this.transportOrderService);

    let deliveryErrors: number = 0;

    this.transportOrderService.deliveries?.forEach ((delivery, index) => {
      deliveryErrors += this.common.getDeliveryErrors (this.transportOrderService, delivery).length;
    });

    return deliveryErrors > 0 || transportErrors.length;
  }
}
