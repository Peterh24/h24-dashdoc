import { TransportService } from './../../../../services/transport.service';
import { Component, OnInit } from '@angular/core';
import { Merchandise } from '../../delivery.model';
import { ModalController } from '@ionic/angular';
import { ModalQuantityComponent } from './modal-quantity/modal-quantity.component';
import { ModalCourseComponent } from './modal-course/modal-course.component';
import { Router } from '@angular/router';

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
    private router: Router
  ) { }

  ngOnInit() {
    this.detectPageValidation();
    console.log('delivery: ', this.transportService.deliveries);
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
      console.log(this.transportService.deliveries);
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
      console.log('merchandises: ', this.merchandises);
      this.isPageValid = true;
    }
  }

  async onMerchandiseSelected(){
    // verifier si il existe plus d'une destination
      // Si il existe plusieur destination verifier si elles sont identique
        // Si elle sont identique on propose d'ajouter un deuxieme point d'enlvement
        // Si elle sont diferente on passe a l'etape suivante


      if(this.transportService.deliveries.length <= 1){
        //Just 1 delvivery so we call the popup for add new delivery
        const modalCourse = await this.modalController.create({
          component: ModalCourseComponent,
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

      } else {
        // multiple delivery so we can check if the destination are different
        alert('multiple deliveries');

        if(false){
          //if destination are the same so we can open the popup
        } else {
          //if not we go to the next page
        }

      }
      console.log('deliveries: ', this.transportService.deliveries);
    //alert('ok')
  }

}
