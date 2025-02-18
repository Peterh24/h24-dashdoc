import { Component, ViewChild } from '@angular/core';
import { IonSelect, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Company } from '../models/company.model';
import { CompanyService } from 'src/app/services/company.service';
import { DASHDOC_COMPANY, USER_STORAGE_KEY } from 'src/app/services/constants';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AddressService } from 'src/app/services/address.service';
import { ContactsService } from 'src/app/services/contacts.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { ApiTransportService } from 'src/app/services/api-transport.service';
import { ConfigService } from 'src/app/services/config.service';
import { TransportOrderService } from 'src/app/services/transport-order.service';
import { TransportService } from 'src/app/services/transport.service';
import { User } from '../models/user.model';
import { firstValueFrom, take } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  loadedCompanies: Array<Company>;
  currentUser: User;
  selectedCompanyId: any;
  showResetTransport = false;

  @ViewChild('companyChoose', { static: false }) companyChoose: IonSelect;
  constructor(
    public config: ConfigService,
    public companyService: CompanyService,
    public transportService: TransportService,
    private storage: Storage,
    private apiTransport: ApiTransportService,
    private authService: AuthService,
    private addressService: AddressService,
    private contactService: ContactsService,
    private loadingController: LoadingController,
    private router: Router,
    private transportOrderService: TransportOrderService,
    private notifications: NotificationsService,
  ) { }

  ionViewWillEnter(){
    this.currentUser = this.authService.currentUser;

    this.authService.loadCurrentUserDetail(this.authService.currentUser?.id).pipe(take(1)).subscribe((user:any) => {
      this.currentUser = user;

      this.companyService.fetchCompanies().pipe(take(1)).subscribe((companies) => {
        this.loadedCompanies = companies;

        this.storage.get(DASHDOC_COMPANY).then((company) => {
          if(company && this.selectedCompanyId !== company){
            this.selectedCompanyId = company;
            this.onChooseCompany(company)
          }
        })
      })
    })

    this.notifications.update ();
  }

  async onChooseCompany(companyId: number) {
    if (this.companyService.currentCompany?.id !== companyId) {
      this.transportService.resetTransports();
      this.companyService.isCompanySwitch = true;

      const loading = await this.loadingController.create({
        keyboardClose: true,
        message: '<div class="h24loader"></div>',
        spinner: null,
      });

      await loading.present();

      const currentCompany = this.companyService.getCompany(companyId);
      loading.dismiss();
      if (currentCompany) {
        await firstValueFrom (this.companyService.setCurrentCompany(currentCompany.id));
        this.storage.set(USER_STORAGE_KEY, currentCompany.token || currentCompany.id).then (() => this.companyService.getCompanyStatus () );
        this.storage.set(DASHDOC_COMPANY, companyId);
        this.companyService.isCompanySwitch = false;
        this.addressService.resetAddresses ();
        this.contactService.resetContacts ();
        this.transportOrderService.resetTransport ();
      }
    } else {
      await this.companyService.setCurrentCompany(companyId);
      this.companyService.isCompanySwitch = false;
    }
  }

  openSelect(){
    this.companyChoose.open();
  }

  onNewOrder () {
    if (this.transportOrderService.type) {
      this.showResetTransport = true;
    } else {
      this.router.navigateByUrl ('/private/tabs/transports/new-order');
    }
  }

  setShowResetTransport (value = true) {
    this.showResetTransport = value;
  }

  setResetTransport (value: boolean, modal: any) {
    this.showResetTransport = false;
    modal.dismiss ();

    if (value) {
      this.transportOrderService.resetTransport ();
      this.router.navigateByUrl('/private/tabs/transports/new-order');
    } else {
      if (this.config.isDesktop) {
        if (this.transportOrderService.deliveries?.length) {
          this.router.navigateByUrl('/private/tabs/transports/new-order/deliveries');
        } else {
          this.router.navigateByUrl('/private/tabs/transports/new-order');
        }
      } else {
        if (this.transportOrderService.isMultipoint === true || this.transportOrderService.isMultipoint === false) {
          this.router.navigateByUrl ('/private/tabs/transports/new-order/deliveries')
        } else if (this.transportOrderService.vehicle) {
          this.router.navigateByUrl ('/private/tabs/transports/new-order/multipoint-choice');
        } else if (this.transportOrderService.type) {
          this.router.navigateByUrl('/private/tabs/transports/new-order/vehicle-choice');
        } else {
          this.router.navigateByUrl('/private/tabs/transports/new-order');
        }
      }
    }
  }
}
