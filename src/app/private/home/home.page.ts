import { Component, OnDestroy, ViewChild } from '@angular/core';
import { AlertController, IonSelect, LoadingController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Subscription, catchError, take } from 'rxjs';
import { ModalAddTokenComponent } from './modal-add-token/modal-add-token.component';
import { Company } from '../models/company.model';
import { CompanyService } from 'src/app/services/company.service';
import { API_URL, DASHDOC_API_URL, DASHDOC_COMPANY, USER_STORAGE_KEY } from 'src/app/services/constants';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ModalAddCompanyComponent } from './modal-add-company/modal-add-company.component';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { TransportService } from 'src/app/services/transport.service';
import { Router } from '@angular/router';
import { AddressService } from 'src/app/services/address.service';
import { ContactsService } from 'src/app/services/contacts.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { ApiTransportService } from 'src/app/services/api-transport.service';
import { ConfigService } from 'src/app/services/config.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnDestroy {
  private companiesSub: Subscription;
  private currentCompany: Subscription;
  loadedCompanies: Array<Company>;
  isCompanySelected: boolean = false;
  firstname: string;
  lastname: string;
  currentUser: any;
  selectedCompanyId: any; // Ajoutez cette variable
  @ViewChild('companyChoose', { static: false }) companyChoose: IonSelect;
  constructor(
    private storage: Storage,
    public companyService: CompanyService,
    private apiTransport: ApiTransportService,
    private authService: AuthService,
    private addressService: AddressService,
    private contactService: ContactsService,
    private loadingController: LoadingController,
    private router: Router,
    public deliveriesService: DeliveriesService,
    private transportService: TransportService,
    private notifications: NotificationsService,
    public config: ConfigService
  ) { }
  
  ionViewWillEnter(){
    this.currentUser = this.authService.currentUser;
    this.authService.loadCurrentUserDetail(this.currentUser?.id).pipe(take(1)).subscribe((user:any) => {
      this.firstname = user.firstname?.[0]?.toUpperCase() + user.firstname?.slice(1)?.toLowerCase();

      this.lastname = user.lastname;
      this.companyService.fetchCompanies().pipe(take(1)).subscribe((companies) => {
        this.loadedCompanies = companies;

        this.storage.get(DASHDOC_COMPANY).then((company) => {
          if(company && this.selectedCompanyId !== company){
            this.selectedCompanyId = company;
            this.onchooseCompany(company)
          } else {}
  
        })
      })
    })

    this.notifications.update ();
  }

  async onchooseCompany(event: any) {
    const currentCompany = event && event.detail ? event.detail.value || event : event;

    await this.storage.get(DASHDOC_COMPANY).then(async (company) => {
      if (company !== currentCompany) {
        this.deliveriesService.resetDeliveries();
        this.companyService.isCompanySwitch = true;
  
        const loading = await this.loadingController.create({
          keyboardClose: true,
          message: '<div class="h24loader"></div>',
          spinner: null,
        });
  
        await loading.present();
  
        this.currentCompany = this.companyService.getCompany(currentCompany).subscribe((company) => {
          loading.dismiss();
          this.apiTransport.chooseCompany (currentCompany).subscribe ();
          if (company) {
            this.companyService.setCompanyName(company.name);
            this.storage.set(USER_STORAGE_KEY, company.token || company.pk).then (() => this.companyService.getCompanyStatus () );
            this.storage.set(DASHDOC_COMPANY, currentCompany);
            this.config.setCurrentCompany (currentCompany);
            this.isCompanySelected = true;
            this.companyService.isCompanySwitch = false;
            this.addressService.resetAddresses ();
            this.contactService.resetContacts ();
          }
        });
      } else {
        this.apiTransport.chooseCompany (currentCompany).subscribe ();
        this.currentCompany = this.companyService.getCompany(currentCompany).subscribe((company) => {
          this.companyService.setCompanyName(company.name);
          this.isCompanySelected = true;
          this.companyService.isCompanySwitch = false;
          this.companyService.getCompanyStatus ();
        });
      }
    });
  }

  openSelect(){
    this.companyChoose.open();
  }

  onNewOrder () {
    this.transportService.resetTransport ();
    this.router.navigateByUrl ('/private/tabs/transports/new-order');
  }

  ngOnDestroy() {
    if(this.companiesSub) {
      this.companiesSub.unsubscribe();
    }
    if(this.currentCompany) {
      this.currentCompany.unsubscribe();
    }
  }
}
