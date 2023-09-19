import { TransportService } from './../../../../services/transport.service';
import { Component, OnInit } from '@angular/core';
import { Merchandise } from '../../delivery.model';
import { ModalController } from '@ionic/angular';
import { ModalQuantityComponent } from './modal-quantity/modal-quantity.component';
import { ModalCourseComponent } from './modal-course/modal-course.component';
import { Router } from '@angular/router';
import { UtilsService } from 'src/app/utils/services/utils.service';

@Component({
  selector: 'app-merchandise',
  templateUrl: './merchandise.page.html',
  styleUrls: ['./merchandise.page.scss'],
})
export class MerchandisePage implements OnInit {
  isPageValid: boolean = false;
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
    private transportService: TransportService,
    private router: Router,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {
    this.detectPageValidation();

  }

  ionViewWillEnter() {
  }

  async onMerchandiseClick(itemId: string, itemName: string, quantity: number) {
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

    if (data) {
      const index = this.merchandises.findIndex(merchandise => merchandise.id === data.id);

      // Mise à jour dans la liste de merchandises
      if (index !== -1) {
        this.merchandises[index].quantity = data.quantity;
        this.merchandises[index].name = data.name;
      } else {
        this.merchandises.push({
          id: data.id,
          name: data.name,
          quantity: data.quantity
        });
      }

      // Mise à jour dans la liste des planned_loads
      const lastIndex = this.transportService.deliveries.length - 1;
      const plannedLoads = this.transportService.deliveries[lastIndex].planned_loads;

      const existingIndex = plannedLoads.findIndex((item:any) => item.id === data.id);

      if (existingIndex !== -1) {
        plannedLoads[existingIndex] = {
          id: data.id,
          name: data.name,
          quantity: data.quantity
        };
      } else {
        plannedLoads.push({
          id: data.id,
          name: data.name,
          quantity: data.quantity
        });
      }

      this.detectPageValidation();
    }
  }

  getImage(image: string){
    if(image.includes('other')){
      return 'other';
    }
    return image;
  }

  detectPageValidation(){
    this.isPageValid = false;
    if(this.merchandises.some(merchandise => merchandise.quantity > 0)){
      this.isPageValid = true;
    }
  }

  async onMerchandiseSelected(){
    if(!this.transportService.isEditMode){
      if(this.transportService.deliveries.length <= 1){
        //Just 1 delvivery so we call the popup for add new delivery
        this.openPopupAdd();
      } else {
          // multiple delivery so we can check if the origin are different
          if(!this.utilsService.areAllValuesIdentical(this.transportService.deliveries, 'origin', 'address')){
            //if origin are the same so we can open the popup
            this.openPopupAdd();
          } else {
            this.router.navigateByUrl('/private/tabs/transports/new-delivery/delivery');
          }
        }
      } else {
        this.transportService.deliveries[this.transportService.deliveries.length -1].destination = this.transportService.deliveries[0].destination;
        this.router.navigateByUrl('/private/tabs/transports/new-delivery/summary');
      }
  }


  async openPopupAdd(){
    const modalCourse = await this.modalController.create({
      component: ModalCourseComponent,
      componentProps: {
        type: 'origin',
      },
      cssClass: 'course-modal',
      mode: 'ios'
    });
    modalCourse.present();
    const { data } = await modalCourse.onWillDismiss();

    if (data.choice === 'yes') {
      //If user choose to add one origin
      this.router.navigateByUrl('/private/tabs/transports/new-delivery/pick-up');
    } else {
      //If choose to keep just on origin
      this.router.navigateByUrl('/private/tabs/transports/new-delivery/delivery');
    }
  }

}
