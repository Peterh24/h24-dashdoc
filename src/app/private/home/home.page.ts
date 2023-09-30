import { InvoiceService } from 'src/app/services/invoice.service';
import { AddressService } from 'src/app/services/address.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSelect, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { EMPTY, Subscription, catchError, of, take, throwError } from 'rxjs';
import { ModalAddTokenComponent } from './modal-add-token/modal-add-token.component';
import { Company } from '../models/company.model';
import { CompanyService } from 'src/app/services/company.service';
import { API_URL, DASHDOC_API_URL, DASHDOC_COMPANY, USER_STORAGE_KEY } from 'src/app/services/constants';
import { DeliveriesService } from 'src/app/services/deliveries.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';


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
  currentUser: any;
  @ViewChild('companyChoose', { static: false }) companyChoose: IonSelect;
  constructor(
    private storage: Storage,
    private http: HttpClient,
    public companyService: CompanyService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
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
    this.currentUser = this.authService.currentUser;
    console.log("user: ", this.currentUser);
    this.http.get(`${API_URL}app_users/${this.currentUser.id}`).pipe(take(1)).subscribe((user:any) => {
      this.authService.currentUserDetail = user;
      this.firstname = user.firstname;
      this.lastname = user.lastname
      this.companyService.fetchCompanies();
      this.companyService.companies.subscribe((companies) => {
        this.loadedCompanies = companies;
      })
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
      const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
      this.http.get(`${DASHDOC_API_URL}addresses/`, { headers }).pipe(
        take(1),
        catchError(async (error) => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              const alert = await this.alertController.create({
                header: 'Erreur',
                message: 'votre token <b>' + token + '</b> est incorect merci de le verifier dans votre interface dashdoc',
                buttons: ['Compris'],
              });
              await alert.present();
            }
            throw error;
          }
          
        })
      ).subscribe((res: any) => {
        const tokenToAdd = {user:`${API_URL}app_users/${this.currentUser.id}`, token: token}
        this.http.post(`${API_URL}app_dashdoc_tokens`, tokenToAdd).pipe(take(1)).subscribe((res) => {
          console.log('res: ', res);
        })
        }
      )


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
