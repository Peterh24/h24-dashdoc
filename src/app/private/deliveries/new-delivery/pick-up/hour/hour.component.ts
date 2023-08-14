import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-hour',
  templateUrl: './hour.component.html',
  styleUrls: ['./hour.component.scss'],
})
export class HourComponent  implements OnInit {

  constructor(private modalController: ModalController) { }
  @Input() type: string;
  minDate: string;
  @ViewChild('dateTime', { static: false }) dateTimePicker: IonDatetime;

  ngOnInit() {

    this.minDate = new Date().toISOString();
  }


  async closeModal() {
    await this.modalController.dismiss();
  }

  async onChange() {
    const time = this.dateTimePicker.value;
    await this.modalController.dismiss(time);
  }
}
