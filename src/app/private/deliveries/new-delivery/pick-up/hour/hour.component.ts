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


  if (this.page === 'destination') {
    this.minVal = format(new Date(), 'yyyy-MM-dd');

    let maxDeliveryDate: Date | null = null;

    this.transportService.deliveries.forEach(delivery => {
      const deliveryStartDate = new Date(delivery.origin.slots[0].start);

      if (!maxDeliveryDate || deliveryStartDate > maxDeliveryDate) {
        maxDeliveryDate = deliveryStartDate;
        this.defaultValue = deliveryStartDate;
      }
    });

    if (maxDeliveryDate) {

      if (this.type === 'date') {
        this.minVal = format(maxDeliveryDate, 'yyyy-MM-dd');
        this.defaultValue = this.minVal;
      } else {
        const storedDate = this.form.get('date').value;
        const currentDate = format(maxDeliveryDate, 'yyyy-MM-dd');
        console.log('storedDate: ', storedDate);
        console.log('currentDate: ', currentDate);
        if(storedDate != currentDate){
          const pastDate = new Date(2000, 0, 1);
          this.minVal = format(pastDate, "yyyy-MM-dd'T'HH:mm:ss");
        } else {
          const minTime = addHours(new Date(), 1);
          this.minVal = format(minTime, "yyyy-MM-dd'T'HH:mm:ss");
        }
      }


    }
  } else {
    if(this.form.get('date').value != '') {
      const storedDate = this.form.get('date').value;
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      this.minVal = format(new Date(), 'yyyy-MM-dd');
      this.defaultValue = storedDate;
      if (this.type != 'date') {
        if(storedDate != currentDate){
          const pastDate = new Date(2000, 0, 1);
          this.minVal = format(pastDate, "yyyy-MM-dd'T'HH:mm:ss");
          this.defaultValue = this.minVal;
        } else {
          const minTime = addHours(new Date(), 1);
          this.minVal = format(minTime, "yyyy-MM-dd'T'HH:mm:ss");
          this.defaultValue = this.minVal;
        }
      }


    } else {
      this.minVal = format(new Date(), 'yyyy-MM-dd');
      this.defaultValue = this.minVal;
    }

  }
}

  async onChange(value:any){
    const val = value;
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
