import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Address } from '../address.model';
import { Country } from '../../../../private/models/country.model';
import { take, Subscription } from 'rxjs';
import { CountriesService } from 'src/app/utils/services/countries.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
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
  @Input()isModal: boolean;
  @Input()addressPk: string;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private countriesService: CountriesService,
    private addressService: AddressService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(
      paramMap => {
        const addressId = paramMap.get('adressId') || this.addressPk;

        this.addressService.getAddress(addressId).subscribe(address => {
          this.address = address;
          this.countries = this.countriesService.countries;

          this.form = new FormGroup({
            name: new FormControl(this.address?.name, {
              validators: [Validators.required]
            }),
            address: new FormControl(this.address?.address, {
              validators: [Validators.required]
            }),
            postal: new FormControl(this.address?.postcode, {
              validators: [Validators.required]
            }),
            city: new FormControl(this.address?.city, {
              validators: [Validators.required]
            }),
            country: new FormControl(this.address?.country, {
              validators: [Validators.required]
            }),
            instructions: new FormControl(this.address?.instructions, {
              validators: []
            })
          })

        })
      }
    );
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
      this.addressService.updateAddress(this.address.pk,  this.address.name, this.address.address, this.address.postcode, this.address.city, this.address.country, this.address.instructions).subscribe((res) => {
        loadingElement.dismiss();
        this.form.reset();

        if(!this.isModal) {
          this.router.navigate(['/private/tabs/profile/address']);
          return;
        } else {
          this.modalController.dismiss(res);
        }
      })
    })

  }

}
