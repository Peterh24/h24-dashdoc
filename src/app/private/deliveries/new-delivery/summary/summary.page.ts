import { Component, OnInit } from '@angular/core';
import { TransportService } from 'src/app/services/transport.service';
import { UtilsService } from 'src/app/utils/services/utils.service';
import { Delivery } from '../../delivery.model';
import { ModalController } from '@ionic/angular';
import { AddReferenceComponent } from './add-reference/add-reference.component';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {
  vehicle: any;
  deliveries: Array<any> = [];
  isSingleOrigin: Boolean = false;
  defaultTransport: any = {
    "carrier_address": 47895693,
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
    ) { }

  ngOnInit() {
    this.isSingleOrigin = this.utilsService.areAllValuesIdentical(this.transportService.deliveries, 'origin', 'address');
    this.transportService.trailers.push({
      "license_plate": this.transportService.vehicle
    });
    this.transportService.deliveries.forEach(delivery => {
      let segment = {
        origin: delivery.origin,
        destination: delivery.destination,
        trailer:this.transportService.trailers
      }
      this.transportService.segments.push(segment);
    })
    console.log('DELIVERIES: ', this.transportService.deliveries);
    console.log('SEGMENTS: ', this.transportService.segments);
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

  editParts(){

  }

  async onValidate(){
    let dataToApi = {
      ...this.defaultTransport,
      deliveries: this.transportService.deliveries,
      segments: this.transportService.segments
    };

    const modal = await this.modalCtrl.create({
      component: AddReferenceComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      const ref = data;
      // Ajoutez la propriété "shipper_reference" à chaque élément de l'array "deliveries"
      dataToApi.deliveries.forEach((delivery: any) => {
        delivery.shipper_reference = ref;
      });
      console.log('dataToApi: ', dataToApi);
    } else {
      console.log('dataToApi: ', dataToApi);
    }

  }


}
