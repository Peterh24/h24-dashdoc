import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { DeliveriesService } from 'src/app/services/deliveries.service';

@Component({
  selector: 'app-checkout-delivery',
  templateUrl: './checkout-delivery.component.html',
  styleUrls: ['./checkout-delivery.component.scss'],
})
export class CheckoutDeliveryComponent {
  transportId: string;
  paymentRequest: any = {};
  iframeSrc: any;
  status: string;
  paymentExpress: boolean;

  constructor(    
    private deliveriesService: DeliveriesService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private alertController: AlertController
  ) { }

  ionViewWillEnter() {
    this.status = null;

    // TODO: sauvegarde/restauration de la préférence de paiement de l'utilisateur
    this.paymentExpress = false;

    this.route.queryParamMap.subscribe (queryMap => {
      // TODO: on lit le statut depuis l'api
      this.transportId = queryMap.get ("transport");
      if (queryMap.get('status')) {
        this.status = queryMap.get('status');
      }

      // TODO: à supprimer
      this.deliveriesService.getMoneticoPaymentRequest (this.getPaymentRequestParams (false)).subscribe ({
        next: (res) => {
          console.log (res);
          console.log (this.getPaymentRequestParams (false));
          this.paymentRequest = res;
        },
        error: (error) => {
          this.handleRequestError (error);        
        }
      });  
    })
  }

  getPaymentRequestParams (useIframe: boolean = false) {
    return {
      transport: this.transportId,
      language: navigator.language.split(/\W/)[0],
      iframe: useIframe,
      aliascb: this.paymentExpress,
      url_retour_ok: location.href + '&status=ok',
      url_retour_err: location.href + '&status=err',
    }
  }

  pay (form: any) {
    this.deliveriesService.getMoneticoPaymentRequest (this.getPaymentRequestParams (false)).subscribe ({
      next: (res) => {
        this.paymentRequest = res;
        setTimeout (() => {
          form.submit();
        }, 100);
      },
      error: (error) => {
        this.handleRequestError (error);
      }
    });
  }

  payByIframe () {
    this.deliveriesService.getMoneticoPaymentRequest (this.getPaymentRequestParams(true)).subscribe ({
      next: (res: any) => {
        const src = res.paymentUrl + '?' + new URLSearchParams(res.formFields).toString ();
        this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl (src);
      },
      error: (error) => {
        this.handleRequestError (error);        
      }
    });
  }

  onPaymentExpressToggle (event: any) {
    this.paymentExpress = !this.paymentExpress;
  }

  async handleRequestError (error: any) {
    console.error (error);

    const alert = await this.alertController.create({
      header: 'Erreur',
      message: 'Echec requête de paiement: ' + error.error.message,
      buttons: ['Ok']
    });  

    await alert.present();
  }
}
