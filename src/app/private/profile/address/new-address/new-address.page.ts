import { Component, Input, OnInit } from '@angular/core';
import { Address } from '../address.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from '../../../../private/models/country.model';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';

import { CountriesService } from '../../../../utils/services/countries.service';
import { AddressService } from '../../../../services/address.service';
import { take } from 'rxjs';
import { HTTP_REQUEST_UNKNOWN_ERROR } from 'src/app/services/constants';

@Component({
  selector: 'app-new-address',
  templateUrl: './new-address.page.html',
  styleUrls: ['./new-address.page.scss'],
})
export class NewAddressPage implements OnInit {
  address: Address;
  form: FormGroup;
  countries: Array<Country>;
  @Input()isModal: boolean;
  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private countriesService: CountriesService,
    private addressService: AddressService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router,
  ) { }

  ngOnInit() {
    this.countries = this.countriesService.countries;
      this.form = new FormGroup({
        name: new FormControl(null, {
          validators: [Validators.required]
        }),
        address: new FormControl(null, {
          validators: [Validators.required]
        }),
        postal: new FormControl(null, {
          validators: [Validators.required]
        }),
        city: new FormControl(null, {
          validators: [Validators.required]
        }),
        country: new FormControl("FR", {
          validators: [Validators.required]
        }),
        instructions: new FormControl(null, {
          validators: []
        })
      });
  }

  async onCreateOffer(){
    if(!this.form.valid) {
      return;
    }
    this.loadingController.create({
      message: '<div class="h24loader"></div>',
    }).then(loadingElement => {
      loadingElement.present();
      this.addressService.addAdress(this.form.value.name, this.form.value.address, this.form.value.city, this.form.value.postal, this.form.value.country, this.form.value.instructions || '').subscribe({
        next: (res) => {
          loadingElement.dismiss();
          this.form.reset;
          if(!this.isModal) {
            this.router.navigate(['/private/tabs/profile/address']);
            return;
          } else {
            this.modalController.dismiss(res);
          }
        },
        error: async (error) => {
          console.log (error);

          const alert = await this.alertController.create({
            header: "Erreur",
            message: HTTP_REQUEST_UNKNOWN_ERROR,
            buttons: ['Compris'],
          });
    
          await alert.present();    
        }
      });
    });
  }

  cancel() {
    this.modalController.dismiss();
  }

}
