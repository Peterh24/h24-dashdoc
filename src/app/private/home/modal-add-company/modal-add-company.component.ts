import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

/**
 * @deprecated TODO
 */

@Component({
  selector: 'app-modal-add-company',
  templateUrl: './modal-add-company.component.html',
  styleUrls: ['./modal-add-company.component.scss'],
})
export class ModalAddCompanyComponent  implements OnInit {

  company: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss(this.company, 'confirm');
  }

}
