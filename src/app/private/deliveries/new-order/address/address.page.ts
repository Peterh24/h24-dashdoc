import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { catchError, EMPTY, of, switchMap, take } from 'rxjs';
import { AddressService } from 'src/app/services/address.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.page.html',
  styleUrls: ['./address.page.scss'],
})
export class AddressPage implements OnInit {
  isLoading = false;
  addresses: any[];

  constructor(
    private modalController: ModalController,
    private addressService: AddressService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter () {
    this.isLoading = true;
    
    this.addressService.address
      .pipe(
        take(1),
        switchMap(address => {
          console.log ("address", address);
          if (address.length > 0) {
            return of(address);
          } else {
            return this.addressService.fetchAddress().pipe(
              catchError(error => {
                console.error('Error fetching address:', error);
                return EMPTY;
              })
            );
          }
        })
      )
      .subscribe(addresses => {
        this.addresses = addresses;
        this.isLoading = false;
      });
  }

  closeModal () {
    this.modalController.dismiss ();
  }

  onSubmit (address: any) {
    console.log (address);

    this.modalController.dismiss(address);
  }

}
