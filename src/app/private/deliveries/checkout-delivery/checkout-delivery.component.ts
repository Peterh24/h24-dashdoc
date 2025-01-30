import { ChangeDetectorRef, Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HTTP_REQUEST_UNKNOWN_ERROR } from 'src/app/services/constants';
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
  iframeFullScreen: boolean;
  status: string;
  paymentExpress: boolean;

  constructor(    
    private deliveriesService: DeliveriesService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private alertController: AlertController,
    private cdRef: ChangeDetectorRef
  ) { }

  ionViewWillEnter() {
    this.status = null;

    // TODO: sauvegarde/restauration de la préférence de paiement de l'utilisateur
    this.paymentExpress = false;

    (window as any).validatePaymentFromIFrame = (status: any) => { 
      this.iframeSrc = null;
      this.iframeFullScreen = false;
      this.status = status;

      this.cdRef.detectChanges ();
    };

    this.route.queryParamMap.subscribe (queryMap => {  
      // TODO: on lit le statut depuis l'api
      this.transportId = queryMap.get ("transport");
      if (queryMap.get('status')) {
        this.status = queryMap.get('status');
      }

      // ferme l'iframe & change le statut du paiement dans l'élément parent
      if (this.status && parent !== window && (parent as any).validatePaymentFromIFrame) {
        this.iframeSrc = null;
        (parent as any).validatePaymentFromIFrame (this.status);
        return;
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

  payByIframe (iframeFullScreen: boolean = false) {
    this.iframeFullScreen = iframeFullScreen;
    this.deliveriesService.getMoneticoPaymentRequest (this.getPaymentRequestParams(!iframeFullScreen)).subscribe ({
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
      message: HTTP_REQUEST_UNKNOWN_ERROR,
      buttons: ['Ok']
    });  

    await alert.present();
  }
}
