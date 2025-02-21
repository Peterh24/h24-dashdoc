import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-modal-img',
    templateUrl: './modal-img.component.html',
    styleUrls: ['./modal-img.component.scss'],
    standalone: false
})
export class ModalImgComponent  implements OnInit {

  constructor(private modalController: ModalController) {}
  @Input() src: string;
  @Input() date: string;

  ngOnInit() {}

  async closeModal() {
    await this.modalController.dismiss();
  }
}
