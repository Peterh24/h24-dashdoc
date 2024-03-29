import { Component, Input, OnInit } from '@angular/core';
import { Address } from '../address.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from '../../../../private/models/country.model';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ModalController, NavController } from '@ionic/angular';

import { CountriesService } from '../../../../utils/services/countries.service';
import { AddressService } from '../../../../services/address.service';
import { take } from 'rxjs';

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
    private router: Router,
  ) { }

  ngOnInit() {
    this.countries = this.countriesService.countries;
      this.form = new FormGroup({
        name: new FormControl(null, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        address: new FormControl(null, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        postal: new FormControl(null, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        city: new FormControl(null, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        country: new FormControl(null, {
          validators: [Validators.required]
        }),
        instructions: new FormControl(null, {
          updateOn: 'blur',
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
      this.addressService.addAdress(this.form.value.name, this.form.value.address, this.form.value.city, this.form.value.postal, this.form.value.country, this.form.value.instructions).subscribe(() => {
        loadingElement.dismiss();
        this.form.reset;
        if(!this.isModal) {
          this.router.navigate(['/private/tabs/profile/address']);
          return;
        } else {
          this.modalController.dismiss();
        }
      });
    });
  }

  cancel() {
    this.modalController.dismiss();
  }

}
