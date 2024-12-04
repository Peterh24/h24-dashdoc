import { Component, Input, ViewChild } from '@angular/core';
import { AlertController, IonDatetime, ModalController } from '@ionic/angular';
import { addHours, format, getHours, getMinutes, setHours, setMinutes, subHours } from 'date-fns';
import { TransportService } from 'src/app/services/transport.service';
import { Merchandise } from '../../../delivery.model';
import { ModalQuantityComponent } from '../../merchandise/modal-quantity/modal-quantity.component';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent {
  @ViewChild(IonDatetime, { static: true }) dateTime: IonDatetime;
  @Input() modalType: string;
  @Input() dataToEdit: any;
  @Input() index: any;
  type: string = 'date';
  defaultValue:any;
  minVal: any;
  maxVal: any;
  merchandises: Array<Merchandise> = [
    {
      id: 'camera',
      description: 'Caméra',
      quantity: 0,
      category: 'bulk',
      complementary_information: ''
    },
    {
      id: 'light',
      description: 'lumières',
      quantity: 0,
      category: 'bulk',
      complementary_information: ''
    },
    {
      id: 'photo',
      description: 'Photographie',
      quantity: 0,
      category: 'bulk',
      complementary_information: ''
    },
    {
      id: 'management',
      description: 'Régie',
      quantity: 0,
      category: 'bulk',
      complementary_information: ''
    },
    {
      id: 'clothe',
      description: 'Vêtements',
      quantity: 0,
      category: 'bulk',
      complementary_information: ''
    },
    {
      id: 'machinery',
      description: 'Machinerie',
      quantity: 0,
      category: 'bulk',
      complementary_information: ''
    },
    {
      id: 'furniture',
      description: 'Mobilier / Décor',
      quantity: 0,
      category: 'bulk',
      complementary_information: ''
    }
  ];
  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private transportService: TransportService,
  ) { }

  ionViewWillEnter() {
    if(this.modalType === 'date-origin'){
      let maxDestinationDate: any;
      this.defaultValue = this.dataToEdit.origin.slots[0].start;
      this.minVal = format(new Date(), 'yyyy-MM-dd');



      // Set the max val
      this.transportService.deliveries.forEach(delivery => {
        const destinationStartDate = format(new Date(delivery.destination.slots[0].start), 'yyyy-MM-dd\'T\'HH:mm');
        if (!maxDestinationDate || destinationStartDate > maxDestinationDate) {
          maxDestinationDate = destinationStartDate;
        }
      });
      this.maxVal = format(new Date(maxDestinationDate), 'yyyy-MM-dd');

      // If date is equal to current date min val is Current date + 1 hour
      if(format(new Date(), 'yyyy-MM-dd') === format(new Date(this.defaultValue), 'yyyy-MM-dd')){
        this.minVal = format(addHours(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm');
      }
    } else {
      let maxOriginDate: any;
      this.defaultValue = this.dataToEdit.destination.slots[0].start;
      this.transportService.deliveries.forEach(delivery => {
        const originStartDate = format(new Date(delivery.origin.slots[0].start), 'yyyy-MM-dd\'T\'HH:mm');
        if (!maxOriginDate || originStartDate > maxOriginDate) {
          maxOriginDate = originStartDate;
        }
        this.minVal = format(addHours(new Date(maxOriginDate), 1), 'yyyy-MM-dd\'T\'HH:mm');
        
      })
    }

    this.dataToEdit.planned_loads.forEach((plannedLoad:any) => {
      const merchandise = this.merchandises.find(item => item.id === plannedLoad.id);
      if (merchandise) {
        merchandise.quantity = plannedLoad.quantity;
        merchandise.complementary_information = plannedLoad.complementary_information;
      }
    })
  }

  async openInfo(info: string) {
    const alert = await this.alertController.create({
      header: 'Information',
      message: info,
      buttons: ['OK']
    });

    await alert.present();
  }

  toggleDate(){
    if(this.type === 'date'){
      this.type = 'time';

      if(this.modalType === 'date-destination'){
        const storedDate = this.dataToEdit.destination.slots[0].start;
        let maxOriginDate: any;
        this.transportService.deliveries.forEach(delivery => {
          const originStartDate = format(new Date(delivery.origin.slots[0].start), 'yyyy-MM-dd\'T\'HH:mm');
          if (!maxOriginDate || originStartDate > maxOriginDate) {
            maxOriginDate = originStartDate;
            const isSameday: boolean = format(new Date(storedDate), 'yyyy-MM-dd') === format(new Date(maxOriginDate), 'yyyy-MM-dd');
            if(!isSameday){
              this.minVal = format(new Date(2000, 0, 1), 'yyyy-MM-dd\'T\'HH:mm')             
            }
          }
        })
      }

    } else {
      this.type = 'date';

      if(this.modalType === 'date-destination'){
        let maxOriginDate: any;
        this.defaultValue = this.dataToEdit.destination.slots[0].start;
        this.transportService.deliveries.forEach(delivery => {
          const originStartDate = format(new Date(delivery.origin.slots[0].start), 'yyyy-MM-dd\'T\'HH:mm');
          if (!maxOriginDate || originStartDate > maxOriginDate) {
            maxOriginDate = originStartDate;
          }
          this.minVal = format(addHours(new Date(maxOriginDate), 1), 'yyyy-MM-dd\'T\'HH:mm');
          
        })
      }
    }
  }

  onChange(value:any){
    if(this.modalType === 'date-origin'){
      this.dataToEdit.origin.slots[0].start = value;
      this.dataToEdit.origin.slots[0].end = value;
    } else if(this.modalType === 'date-destination') {
      this.dataToEdit.destination.slots[0].start = value;
      this.dataToEdit.destination.slots[0].end = value;
    }
    this.defaultValue = value;
  }

  async onMerchandiseClick(itemId: string, itemName: string, quantity: number) {
    const modal = await this.modalController.create({
      component: ModalQuantityComponent,
      componentProps: {
        id: itemId,
        description: itemName,
        category: 'bulk',
        quantity: quantity
      },
      cssClass: 'quantity-modal',
      mode: 'ios'
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      const index = this.merchandises.findIndex(merchandise => merchandise.id === data.id);

      // Mise à jour dans la liste de merchandises
      if (index !== -1) {
        this.merchandises[index].quantity = data.quantity;
        this.merchandises[index].description = data.description;
      } else {
        this.merchandises.push({
          id: data.id,
          description: data.description,
          quantity: data.quantity,
          category: 'bulk',
          complementary_information: data.complementary_information
        });
      }

      // Mise à jour dans la liste des planned_loads
      const plannedLoads = this.transportService.deliveries[this.index].planned_loads;

      const existingIndex = plannedLoads.findIndex((item:any) => item.id === data.id);

      if (existingIndex !== -1) {
        plannedLoads[existingIndex] = {
          id: data.id,
          description: data.description,
          category: 'bulk',
          quantity: data.quantity
        };
      } else {
        plannedLoads.push({
          id: data.id,
          description: data.description,
          category: 'bulk',
          quantity: data.quantity
        });
      }

    }
  }

  getImage(image: string){
    if(image.includes('other')){
      return 'other';
    }
    return image;
  }

  cancel() {
    this.modalController.dismiss();
  }

}
