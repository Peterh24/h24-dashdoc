import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-hour',
  templateUrl: './hour.component.html',
  styleUrls: ['./hour.component.scss'],
})
export class HourComponent  implements OnInit {

  constructor(private modalController: ModalController) { }
  @Input() type: string;
  ngOnInit() {}

  async closeModal() {
    await this.modalController.dismiss();
  }

  async onChange(date:Array<string> | string) {
    await this.modalController.dismiss(date);
  }
}
