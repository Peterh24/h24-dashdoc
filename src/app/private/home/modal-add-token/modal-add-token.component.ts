import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

/**
 * @deprecated TODO
 */

@Component({
  selector: 'app-modal-add-token',
  templateUrl: './modal-add-token.component.html',
  styleUrls: ['./modal-add-token.component.scss'],
})
export class ModalAddTokenComponent  implements OnInit {

  token: string;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}





  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(this.token, 'confirm');
  }

}
