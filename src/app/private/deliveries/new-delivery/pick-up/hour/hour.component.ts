import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, ModalController } from '@ionic/angular';
import { addHours, format } from 'date-fns';
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
  @Input() type: string;
  @Input() page: string;
  minDate: string;
  minTime: string;
  @ViewChild('dateTime', { static: false }) dateTimePicker: IonDatetime;

  ngOnInit() {
    this.minDate = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
    this.minTime = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');



    
      this.transportService.deliveries.forEach(delivery => {
        
          if (delivery.origin && delivery.origin.slots && delivery.origin.slots.length > 0) {


            if(this.page === 'destination'){
              console.log('delivery.origin.slots: ', delivery.origin.slots);
              const deliveryStartDate = format(new Date(delivery.origin.slots[0].start),'yyyy-MM-dd\'T\'HH:mm:ss');
              console.log('deliveryStartDate: ', delivery.origin.slots[0].start);
              if (deliveryStartDate > this.minDate) {
                this.minDate = deliveryStartDate;
                this.minTime = format(addHours(new Date(delivery.origin.slots[0].start), 1),'yyyy-MM-dd\'T\'HH:mm:ss');
              }
          }
        }
      })

    
  }
  //2023-08-27T16:47


  async closeModal() {
    await this.modalController.dismiss();
  }

  async onChange() {

    const time: any = this.dateTimePicker.value;
    const date = format(new Date(time), 'yyyy-MM-dd');


    if(format(new Date(this.minDate), 'yyyy-MM-dd') != date){
      this.minTime = '';
    }


    await this.modalController.dismiss(time);
  }
}
