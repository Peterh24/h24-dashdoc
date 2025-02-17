import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { TransportOrderService } from "src/app/services/transport-order.service";

@Component({
  selector: 'app-vehicle-choice',
  templateUrl: './vehicle-choice.page.html',
  styleUrls: ['./vehicle-choice.page.scss'],
})
export class VehicleChoicePage implements OnInit {
  @Input()isModal: boolean;

  constructor (
    public transportOrderService: TransportOrderService,
    private router: Router,
    private modalController: ModalController
  ) {

  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (!this.transportOrderService.type) {
      this.router.navigateByUrl ('/private/tabs/transports/new-order');
      return;
    }
  }

  cancel(){
    this.modalController.dismiss();
  }
}
