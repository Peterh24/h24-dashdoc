import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Address } from '../address.model';
import { Country } from '../../../../private/models/country.model';
import { take, Subscription } from 'rxjs';
import { CountriesService } from 'src/app/utils/services/countries.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController } from '@ionic/angular';
import { AddressService } from 'src/app/services/address.service';

@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.page.html',
  styleUrls: ['./edit-address.page.scss'],
})
export class EditAddressPage implements OnInit {
  address: Address;
  form: FormGroup;
  countries: Array<Country>;
  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private countriesService: CountriesService,
    private addressService: AddressService,
    private loadingController: LoadingController,
    private router: Router
  ) { }

  ngOnInit() {
      this.route.paramMap.subscribe(
        paramMap => {
          if(!paramMap.has('adressId')) {
            this.navController.navigateBack('/private/tabs/profile/address')
            return;
          }
          this.addressService.getAddress(paramMap.get('adressId')).subscribe(address => {
            this.address = address;
            if(!this.address) {
              this.navController.navigateBack('/private/tabs/profile/address')
              return;
            }

            this.form = new FormGroup({
              name: new FormControl(this.address.name, {
                updateOn: 'blur',
                validators: [Validators.required]
              }),
              address: new FormControl(this.address.address, {
                updateOn: 'blur',
                validators: [Validators.required]
              }),
              postal: new FormControl(this.address.postcode, {
                updateOn: 'blur',
                validators: [Validators.required]
              }),
              city: new FormControl(this.address.city, {
                updateOn: 'blur',
                validators: [Validators.required]
              }),
              country: new FormControl(this.address.country, {
                updateOn: 'blur',
                validators: [Validators.required]
              }),
              instructions: new FormControl(this.address.instructions, {
                updateOn: 'blur',
                validators: []
              })
            })
          })
        }
      )
  }


  onSubmit() {
    if(!this.form.valid) {
      return;
    }
    // Mettre à jour les propriétés de l'objet 'address' avec les nouvelles valeurs
    this.address = {...this.address, ...this.form.value}

    this.loadingController.create({
      message: '<div class="h24loader"></div>',
    }).then(loadingElement  =>  {
      loadingElement.present();
      this.addressService.updateAddress(this.address.pk,  this.address.name, this.address.address, this.address.postcode, this.address.city, this.address.country, this.address.instructions).subscribe(() => {
        loadingElement.dismiss();
        this.form.reset();
        this.router.navigate(['/private/tabs/profile/address']);
      })
    })

  }

}
