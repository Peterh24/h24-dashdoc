import { Component, OnDestroy, ViewChild } from '@angular/core';
import { AlertController, IonSelect, LoadingController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Subscription, catchError, of, take, throwError } from 'rxjs';
import { ModalAddTokenComponent } from './modal-add-token/modal-add-token.component';
import { Company } from '../models/company.model';
import { CompanyService } from 'src/app/services/company.service';
import { API_URL, DASHDOC_API_URL, DASHDOC_COMPANY, USER_STORAGE_KEY } from 'src/app/services/constants';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { VehiclesService } from 'src/app/services/vehicles.service';
import { ModalAddCompanyComponent } from './modal-add-company/modal-add-company.component';
import { DeliveriesService } from 'src/app/services/deliveries.service';


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
    private http: HttpClient,
    public companyService: CompanyService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    public deliveriesService: DeliveriesService,
  ) { }

  ionViewWillEnter(){
    this.currentUser = this.authService.currentUser;
    this.http.get(`${API_URL}app_users/${this.currentUser.id}`).subscribe((user:any) => {
      this.authService.currentUserDetail = user;
      this.firstname = user.firstname;
      this.lastname = user.lastname
      this.companyService.fetchCompanies();
      
      this.companyService.companies.subscribe((companies) => {
        this.loadedCompanies = companies;
      })

      this.storage.get(DASHDOC_COMPANY).then((company) => {
        if(company){
          this.selectedCompanyId = company;
          this.onchooseCompany(company)
        } else {}

      })
    }) 
  }

  async onAddCompany(type:string) {
    const modal = await this.modalCtrl.create({
      component: type ==='token' ? ModalAddTokenComponent : ModalAddCompanyComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      if(type === "token"){
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
          this.http.post(`${API_URL}app_dashdoc_tokens`, tokenToAdd).pipe(
            take(1),
            catchError(async (error) => {
              if (error instanceof HttpErrorResponse) {
                if (error.status === 400) {
                  const alert = await this.alertController.create({
                    header: 'Erreur',
                    message: 'votre token <b>' + token + '</b> a déja été ajouté précédement',
                    buttons: ['Compris'],
                  });
                  await alert.present();
                }
                throw error;
              }
            })
            ).subscribe(
            (res) => {
            // Ajout du token
            this.companyService.addCompany(token);
            },
            
          )
          }
        )
      } else {
        const company = data;
        const companyToAdd = {company: company};

        this.http.put(`${API_URL}app_users/${this.currentUser.id}/company`, companyToAdd).pipe(
          take(1),
          catchError(async (error) => {
            if (error instanceof HttpErrorResponse) {
              if (error.status === 400) {
                const alert = await this.alertController.create({
                  header: 'Erreur',
                  message: 'votre company <b>' + company + '</b> a déja été ajouté précédement',
                  buttons: ['Compris'],
                });
                await alert.present();
              }
              throw error;
            }
          })
          ).subscribe(
          (res) => {
          }
        )
      }
      
      
    }
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
          this.companyService.setCompanyName(company.name);
          this.storage.set(USER_STORAGE_KEY, company.token);
          this.storage.set(DASHDOC_COMPANY, currentCompany);
          this.isCompanySelected = true;
          this.companyService.isCompanySwitch = false;
        });
      } else {
        this.currentCompany = this.companyService.getCompany(currentCompany).subscribe((company) => {
          this.companyService.setCompanyName(company.name);
          this.isCompanySelected = true;
          this.companyService.isCompanySwitch = false;
        });
      }
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
