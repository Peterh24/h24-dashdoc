import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, ModalController } from '@ionic/angular';
import { addHours, format, parseISO } from 'date-fns';
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
    }
  } else if(this.type == 'time') { //TIME
    //const currentDate = format(maxDeliveryDate, 'yyyy-MM-dd');

    if (this.page === 'destination') { //TIME DESTINATION

      console.log('test: ', this.lastDeliveryDate('origin'))
      alert('time destination');
    } else { //TIME ORIGIN
      if(format(new Date(), 'yyyy-MM-dd') === this.form.get('date').value){
        this.minVal = format(addHours(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm');
      } else {
        this.minVal = format(new Date(2000, 0, 1), 'yyyy-MM-dd\'T\'HH:mm');
      }
    }

  }
  this.defaultValue = this.minVal;


  // if (this.page === 'destination') {
  //   this.minVal = format(new Date(), 'yyyy-MM-dd');

  //   let maxDeliveryDate: Date | null = null;

  //   this.transportService.deliveries.forEach(delivery => {
  //     const deliveryStartDate = new Date(delivery.origin.slots[0].start);

  //     if (!maxDeliveryDate || deliveryStartDate > maxDeliveryDate) {
  //       maxDeliveryDate = deliveryStartDate;
  //       this.defaultValue = deliveryStartDate;
  //     }
  //   });

  //   if (maxDeliveryDate) {

  //     if (this.type === 'date') {
  //       this.minVal = format(maxDeliveryDate, 'yyyy-MM-dd');
  //       this.defaultValue = this.minVal;
  //     } else {
  //       const storedDate = this.form.get('date').value;
  //       const currentDate = format(maxDeliveryDate, 'yyyy-MM-dd');
  //       if(storedDate != currentDate){
  //         const pastDate = new Date(2000, 0, 1);
  //         this.minVal = format(pastDate, "yyyy-MM-dd'T'HH:mm:ss");
  //       } else {
  //         const minTime = addHours(new Date(), 1);
  //         this.minVal = format(minTime, "yyyy-MM-dd'T'HH:mm:ss");
  //       }
  //       this.defaultValue = this.minVal;
  //     }


  //   }
  // } else {



  //   if(this.form.get('date').value != '') {
  //     const storedDate = this.form.get('date').value;
  //     const currentDate = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm');
  //     this.minVal = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm');
  //     this.defaultValue = storedDate;
  //     if (this.type != 'date') {
  //       if(storedDate != currentDate){
  //         const pastDate = new Date(2000, 0, 1);
  //         this.minVal = format(pastDate, 'yyyy-MM-dd\'T\'HH:mm');
  //         this.defaultValue = this.minVal;
  //       } else {
  //         const minTime = addHours(new Date(), 1);
  //         this.minVal = format(minTime, 'yyyy-MM-dd\'T\'HH:mm');
  //         this.defaultValue = this.minVal;
  //       }
  //     }


  //   } else {
  //     this.minVal = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm');
  //     this.defaultValue = this.minVal;
  //   }

  // }
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
