import { InvoiceService } from 'src/app/services/invoice.service';
import { AddressService } from 'src/app/services/address.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonSelect, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Subscription, take } from 'rxjs';
import { ModalAddTokenComponent } from './modal-add-token/modal-add-token.component';
import { Company } from '../models/company.model';
import { CompanyService } from 'src/app/services/company.service';
import { API_URL, DASHDOC_COMPANY, USER_STORAGE_KEY } from 'src/app/services/constants';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  private companiesSub: Subscription;
  private currentCompany: Subscription;
  loadedCompanies: Array<Company>;
  isCompanySelected: boolean = false;
  firstname: string;
  lastname: string;
  @ViewChild('companyChoose', { static: false }) companyChoose: IonSelect;
  constructor(
    private storage: Storage,
    private http: HttpClient,
    public companyService: CompanyService,
    private authService: AuthService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {

    // this.authService.getCurrentUser().pipe(take(1)).subscribe((user:any) => {
    //   console.log('user: ', user);
    //   // this.firstname = user.firstname;
    //   // this.lastname = user.lastname
    //   // this.loadedCompanies = user.appDashdocTokens;
      
    // })

    // this.companiesSub = this.companyService.companies.subscribe(companies => {
      

    // })
  }

  ionViewWillEnter(){
    const user = this.authService.currentUser;
    console.log("user: ", user);
    this.http.get(`${API_URL}app_users/${user.id}`).pipe(take(1)).subscribe((user:any) => {
      this.authService.currentUserDetail = user;
      this.firstname = user.firstname;
      this.lastname = user.lastname
      this.companyService.fetchCompanies();
    }) 
    
    
    
  }

  async onAddCompany() {
    const modal = await this.modalCtrl.create({
      component: ModalAddTokenComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      const token = data;
      //Requette API pour ajouter le token
      alert('Le token ' +data+ ' a ete ajouté');
    }
  }

  onchooseCompany(event: any){
    const currentCompany = event.detail.value;
    this.currentCompany = this.companyService.getCompany(currentCompany).subscribe(company => {
      this.companyService.setCompanyName(company.name);
      this.storage.set(USER_STORAGE_KEY, company.token);
      this.storage.set(DASHDOC_COMPANY, currentCompany);
      this.isCompanySelected = true;
    });
  }

  openSelect(){
    this.companyChoose.open();
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
