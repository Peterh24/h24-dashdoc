import { Component, OnInit } from '@angular/core';
import { Merchandise } from '../../delivery.model';
import { ModalController } from '@ionic/angular';
import { ModalQuantityComponent } from './modal-quantity/modal-quantity.component';

@Component({
  selector: 'app-merchandise',
  templateUrl: './merchandise.page.html',
  styleUrls: ['./merchandise.page.scss'],
})
export class MerchandisePage implements OnInit {
  merchandises: Array<Merchandise> = [
    {
      id: 'camera',
      name: 'Caméra',
      quantity: 0
    },
    {
      id: 'light',
      name: 'lumières',
      quantity: 0
    },
    {
      id: 'photo',
      name: 'Photographie',
      quantity: 0
    },
    {
      id: 'management',
      name: 'Régie',
      quantity: 0
    },
    {
      id: 'clothe',
      name: 'Vêtements',
      quantity: 0
    },
    {
      id: 'machinery',
      name: 'Machinerie',
      quantity: 0
    },
    {
      id: 'furniture',
      name: 'Mobilier / Décor',
      quantity: 0
    }
  ];
  constructor(
    private modalController: ModalController,
  ) { }

  ngOnInit() {
  }

  async onMerchandiseClick(itemId:string, itemName:string, quantity:number){
    const modal = await this.modalController.create({
      component: ModalQuantityComponent,
      componentProps: {
        id: itemId,
        name: itemName,
        quantity: quantity
      },
      cssClass: 'quantity-modal',
      mode: 'ios'
    });

    modal.present();
    const { data } = await modal.onWillDismiss();
    console.log('data: ', data);

    if (data) {
      const index = this.merchandises.findIndex(merchandise => merchandise.id === data.id);
      /*Detect if is personal category*/
      if (index !== -1) {
        this.merchandises[index].quantity = data.quantity;
        this.merchandises[index].name = data.name;
      } else {
        this.merchandises.push({
          id: data.id,
          name: data.name,
          quantity: data.quantity
        })
      }
    }
  }

  getImage(image: string){
    if(image.includes('other')){
      return 'other';
    }
    return image;
  }

}
