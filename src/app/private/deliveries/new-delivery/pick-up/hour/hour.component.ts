import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, ModalController } from '@ionic/angular';
import { addHours, format, getHours, getMinutes, setHours, setMinutes } from 'date-fns';
import { TransportService } from 'src/app/services/transport.service';

@Component({
  selector: 'app-hour',
  templateUrl: './hour.component.html',
  styleUrls: ['./hour.component.scss'],
})
export class HourComponent  implements OnInit {
  constructor(
    private modalController: ModalController,
    private transportService: TransportService,
  ) { }
  fieldValue:any;
  @Input() type: string;
  @Input() page: string;
  @Input() form: any;
  minVal: any;
  defaultValue: any;
  @ViewChild(IonDatetime, { static: true }) dateTime: IonDatetime;

  ngOnInit() {

  }

ionViewWillEnter() {
  this.minVal = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm');
  if(this.type == 'date') { //DATE
    if (this.page === 'destination') { //DATE DESTINATION
      let maxDeliveryDate: any;
      this.transportService.deliveries.forEach(delivery => {
        const originStartDate = format(new Date(delivery.origin.slots[0].start), 'yyyy-MM-dd\'T\'HH:mm');
        if (!maxDeliveryDate || originStartDate > maxDeliveryDate) {
          maxDeliveryDate = originStartDate;
          this.minVal = originStartDate;
        }
      })
    }
  } else if(this.type == 'time') { //TIME

    if (this.page === 'destination') { //TIME DESTINATION
      const storedDate = format(new Date(this.form.get('date').value), 'yyyy-MM-dd\'T\'HH:mm');
      let maxDeliveryDate: any;
      this.transportService.deliveries.forEach(delivery => {
        const originStartDate = format(new Date(delivery.origin.slots[0].start), 'yyyy-MM-dd\'T\'HH:mm');
        if (!maxDeliveryDate || originStartDate > maxDeliveryDate) {
          maxDeliveryDate = originStartDate;
          const isSameday: boolean = format(new Date(storedDate), 'yyyy-MM-dd') === format(new Date(maxDeliveryDate), 'yyyy-MM-dd')
          //last date
          if(isSameday){
            //THIS PART BUG
            const getHour = getHours(new Date(maxDeliveryDate));
            const getMinute = getMinutes(new Date(maxDeliveryDate));
            let newDate = setMinutes(setHours(new Date(), getHour), getMinute);
            let formatNewDate = format(addHours(newDate, 1), 'yyyy-MM-dd\'T\'HH:mm');
            this.minVal = formatNewDate;
          } else {
            this.minVal = format(new Date(2000, 0, 1), 'yyyy-MM-dd\'T\'HH:mm')
          }

        }
      })
    } else { //TIME ORIGIN
      if(format(new Date(), 'yyyy-MM-dd') === this.form.get('date').value){
        this.minVal = format(addHours(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm');
      } else {
        this.minVal = format(new Date(2000, 0, 1), 'yyyy-MM-dd\'T\'HH:mm');
      }
    }

  }
  this.defaultValue = this.minVal;
}

  isCurrentDay() {
    let selectedDate;
    const storedDate = this.form.get('date').value;
    if(this.transportService.deliveries.length > 0) {
      let maxDeliveryDate: any;
      this.transportService.deliveries.forEach(delivery => {
        const deliveryStartDate = new Date(delivery.origin.slots[0].start);

        if (!maxDeliveryDate || deliveryStartDate > maxDeliveryDate) {
          maxDeliveryDate = deliveryStartDate;
          selectedDate = format(maxDeliveryDate, 'yyyy-MM-dd');
      }
    });
    } else {
      selectedDate = format(new Date(), 'yyyy-MM-dd');
    }

    console.log('selectedDate: ', selectedDate);
    console.log('storedDate: ', storedDate);
    if(selectedDate === storedDate){
      return true;
    } else {
      return false;
    }

  }

  lastDeliveryDate(type:string) {
    if(this.transportService.deliveries.length > 0) {
      let maxDeliveryDate: any;
      this.transportService.deliveries.forEach(delivery => {
        console.log('delivery: ', delivery);
        const deliveryStartDate = new Date(delivery[type].slots[0].start);
        if (!maxDeliveryDate || deliveryStartDate > maxDeliveryDate) {
          maxDeliveryDate = deliveryStartDate;
          return maxDeliveryDate;
        }
      })
    }
  }

  async onChange(value:any){
    this.defaultValue = value;
    if(this.type === 'date') {
      await this.modalController.dismiss(value);
    }
  }

  async onTimeChoose(value:any) {
    await this.modalController.dismiss(value);
  }

  async closeModal() {
    await this.modalController.dismiss();
  }
}
