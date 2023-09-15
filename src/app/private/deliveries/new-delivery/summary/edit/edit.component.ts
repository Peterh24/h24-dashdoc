import { Component, Input, ViewChild } from '@angular/core';
import { IonDatetime, ModalController } from '@ionic/angular';
import { addHours, format, subHours } from 'date-fns';
import { TransportService } from 'src/app/services/transport.service';

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
  constructor(
    private modalController: ModalController,
    private transportService: TransportService,
  ) { }

  ionViewWillEnter() {
    if(this.modalType === 'date-origin'){
      this.defaultValue = this.dataToEdit.origin.slots[0].start;

      if(format(new Date(), 'yyyy-MM-dd') === format(new Date(this.defaultValue), 'yyyy-MM-dd')){
        this.minVal = format(addHours(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm');
      } else {
        this.minVal = format(new Date(2000, 0, 1), 'yyyy-MM-dd\'T\'HH:mm');
      }


      this.maxVal = format(subHours(new Date(this.dataToEdit.destination.slots[0].start), 1), 'yyyy-MM-dd\'T\'HH:mm');
    } else if(this.modalType === 'date-destination'){
      this.defaultValue = this.dataToEdit.destination.slots[0].start;
      let maxDeliveryDate: any;
      this.transportService.deliveries.forEach(delivery => {
        const originStartDate = format(new Date(delivery.origin.slots[0].start), 'yyyy-MM-dd\'T\'HH:mm');
        if (!maxDeliveryDate || originStartDate > maxDeliveryDate) {
          maxDeliveryDate = originStartDate;
          this.minVal = originStartDate;
        }
      })
    }
    console.log(this.dataToEdit);
  }

  toggleDate(){
    if(this.type === 'date'){
      this.type = 'time';
    } else {
      this.type = 'date';
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
    this.defaultValue = this.minVal;
  }

  cancel() {
    this.modalController.dismiss();
  }

}
