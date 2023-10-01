import { Component, OnInit } from '@angular/core';
import { TransportService } from 'src/app/services/transport.service';
import { UtilsService } from 'src/app/utils/services/utils.service';
import { AlertController, ModalController } from '@ionic/angular';
import { AddReferenceComponent } from './add-reference/add-reference.component';
import { Storage } from '@ionic/storage-angular';
import { DASHDOC_API_URL, DASHDOC_COMPANY } from 'src/app/services/constants';
import { VehicleChoicePage } from '../vehicle-choice/vehicle-choice.page';
import { HourComponent } from '../pick-up/hour/hour.component';
import { EditComponent } from './edit/edit.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {
  vehicle: any;
  deliveries: Array<any> = [];
  isSingleOrigin: Boolean = false;
  isSingleDestination: Boolean = false;
  defaultTransport: any = {
    "carrier_address": {
      "pk": 67398197,
      "company": {
        "pk": 1755557,
      },
      "is_verified": true,
    },
    "deliveries": [
    ],
    "segments": [
    ],
    "instructions": "Notes exploitant",
    "volume_display_unit": "m3",
    "business_privacy": false,
    "is_template": false,
    "is_multiple_compartments": false,
    "requires_washing": false,
    "send_to_trucker": false,
    "send_to_carrier": true,
    "analytics": {
        "has_price": false
    }
}
  constructor(
    private transportService: TransportService,
    private utilsService: UtilsService,
    private modalCtrl: ModalController,
    private storage: Storage,
    private http: HttpClient,
    private route: Router,
    private alertController: AlertController,
    ) { }

  ngOnInit() {
    this.isSingleOrigin = this.utilsService.areAllValuesIdentical(this.transportService.deliveries, 'origin', 'address');
    this.isSingleDestination = this.utilsService.areAllValuesIdentical(this.transportService.deliveries, 'destination', 'address');
  }

  ionViewDidEnter() {
    this.vehicle = this.transportService.vehicle;
    this.deliveries = this.transportService.deliveries;
  }

  getCountry(countryCode: string): string {
    return countryCode
  }

  getImage(image: string){
    if(image.includes('other')){
      return 'other';
    }
    return image;
  }

  async editParts(type: string, data: any, index: number) {
    let componentElem;
    if (type == 'vehicle') {
      componentElem = VehicleChoicePage
    } else if(type === 'date-origin' || 'date-destination') {
      componentElem = HourComponent
    }

    const modalEdit = await this.modalCtrl.create({
      component: componentElem,
      componentProps: {
        modalType: type,
        isModal: true,
        dataToEdit: data,
        index: index
      }
    });

    modalEdit.present();
    const { data: dataEdit } = await modalEdit.onWillDismiss();
    if(dataEdit){
      // Remplacez this.vehicle par dataEdit
      this.vehicle = dataEdit;

      // Mettez à jour les segments (replicating ngOnInit logic)

    }
  }

  async editDelivery(type: string, data: any, index: number){
    const modalDelivery = await this.modalCtrl.create({
      component: EditComponent,
      componentProps: {
        modalType: type,
        dataToEdit: data,
        index: index
      }
    });
    modalDelivery.present();
  }

  async editAddresses(type:string) {
    this.transportService.isEditMode = true;
    if(type === 'pickup'){
      if(!this.isSingleDestination){
        const alert = await this.alertController.create({
          header: 'Action impossible',
          message: 'vous ne pouvez pas avoir plusieurs origine et plusieur destinations merci d\'editer vos destination afin de n\'en conserver qu\'une seule',
          buttons: ['Compris'],
        });

        await alert.present();
        return;
      }
      this.route.navigateByUrl('/private/tabs/transports/new-delivery/pick-up');
    } else if(type === 'delivery') {
      if(!this.isSingleOrigin){
        const alert = await this.alertController.create({
          header: 'Action impossible',
          message: 'vous ne pouvez pas avoir plusieurs destination et plusieur points d\'enlevement merci de supprimer des points enlevement afin de n\'en conserver qu\'un',
          buttons: ['Compris'],
        });
        await alert.present();
        return;
      }
      this.route.navigateByUrl('/private/tabs/transports/new-delivery/delivery');
    }

  }

  async onValidate() {
    this.transportService.trailers = [];
    this.transportService.segments = [];
    this.transportService.trailers.push({
      "licensePlate": this.transportService.vehicle
    });
    this.transportService.deliveries.forEach(delivery => {
      let segment = {
        origin: delivery.origin,
        destination: delivery.destination,
        trailer:this.transportService.trailers
      }

      this.transportService.segments.push(segment);
    })

    const modal = await this.modalCtrl.create({
      component: AddReferenceComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      const ref = data;
      // Récupérez la valeur pk depuis le storage
      this.storage.get(DASHDOC_COMPANY).then(pk => {
        // Parcourez les livraisons et ajoutez la propriété "shipper_address"
        this.transportService.deliveries.forEach((delivery: any) => {
          delivery.shipper_reference = ref;
          delivery.shipper_address = {
            company: {
              pk: pk
            },
          };
        });

        // Tri des segments en fonction de this.isSingleOrigin
        if (this.isSingleOrigin) {
          // Trier les segments en fonction des plages horaires de destination
          this.transportService.segments.sort((segment1, segment2) => {
            const endTime1: Date = new Date(segment1.destination.slots[0].start);
            const endTime2: Date = new Date(segment2.destination.slots[0].start);
            return endTime1.getTime() - endTime2.getTime(); // Utilisez getTime() pour comparer les dates
          });

          // Réorganisez les origines des segments à partir de l'étape 2
          for (let i = 1; i < this.transportService.segments.length; i++) {
            this.transportService.segments[i].origin = {
              address: { ...this.transportService.segments[i - 1].destination.address },
              instructions: "",
              slots: [{ ...this.transportService.segments[i].origin.slots[0] }]
            };
          }
        } else {
          // Trier les segments en fonction des plages horaires de départ
          this.transportService.segments.sort((segment1, segment2) => {
            const startTime1: Date = new Date(segment1.origin.slots[0].start);
            const startTime2: Date = new Date(segment2.origin.slots[0].start);
            return startTime1.getTime() - startTime2.getTime(); // Utilisez getTime() pour comparer les dates
          });
          for (let i = 0; i < this.transportService.segments.length - 1; i++) {
            // Remplacez la destination actuelle par l'origin du segment suivant
            this.transportService.segments[i].destination = {
              address: { ...this.transportService.segments[i + 1].origin.address },
              instructions: "",
              slots: [{ ...this.transportService.segments[i].destination.slots[0] }]
            };
          }

        }

        // Ajoutez également les données à dataToApi
        let dataToApi = {
          ...this.defaultTransport,
          deliveries: this.transportService.deliveries,
          segments: this.transportService.segments
        };

        this.http.post(`${DASHDOC_API_URL}transports/`, dataToApi).subscribe(async res => {
          const confirm = await this.alertController.create({
            header: 'Bravo votre course a été enregistré',
            message: 'Votre course a été validé et nous est parvenue, en cas de besoin d\'informations complementaire nous vous contacterons sur le numero de telephone present dans votre profile',
            buttons: ['Compris'],
          });

          await confirm.present();
          this.route.navigateByUrl('/private/tabs/transports');
        })
      });
    }
  }


}
