import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, catchError, concatMap, firstValueFrom, forkJoin, from, map, switchMap, take, tap, throwError, toArray } from 'rxjs';
import { Company } from '../private/models/company.model';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { DASHDOC_API_URL, USER_STORAGE_KEY } from './constants';
import { Storage } from '@ionic/storage-angular';
import { DashdocService } from './dashdoc.service';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private _companies = new BehaviorSubject<Array<Company>>([]);
  private _companyName = new BehaviorSubject<string>('');
  private _userHasChooseCompany = new BehaviorSubject<boolean>(false);

  get userHasChooseCompany() {
    return this._userHasChooseCompany.asObservable();
  }

  get companies() {
    return this._companies.asObservable();
  }
  get companyName() {
    return this._companyName.asObservable();
  }
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private dashdocService: DashdocService,
    private alertController: AlertController,
  ) { }

  fetchCompanies() {
    this.dashdocService.fetchTokens().pipe(take(1)).subscribe((tokens) => {
      this.dashdocService.tokens.pipe(take(1)).subscribe(async tokens => {
        if (this._companies.getValue().length > 0) {
          return;
        }

        tokens.forEach(token => {
          const tokenCurrent = token.token;
          const headers = new HttpHeaders().set('Authorization', `Token ${tokenCurrent}`);
          
          this.http.get(`${DASHDOC_API_URL}addresses/`, { headers }).pipe(
            
            catchError(async error => {
              if (error instanceof HttpErrorResponse) {
                if (error.status === 401) {
                const alert = await this.alertController.create({
                  header: 'Erreur',
                  message: 'votre token <b>' + token.token+ '</b> est incorect merci de le verifier dans votre interface dashdoc',
                  buttons: ['Compris'],
                });
        
                await alert.present();
                }
                return EMPTY;
              } 
              
              return EMPTY;
               // Continuer l'itération malgré l'erreur
            })
          ).subscribe(((res:any) => {
            
            if(res.results !== undefined ){
              const newCompany = { ...res.results[0].created_by, token: token.token };
              if (!this._companies.getValue().includes(newCompany)) {
                this._companies.next([...this._companies.getValue(), newCompany]);
              }
            }
            
          }));
        });
      })
    });
  }

  getCompany(pk: number) {
    return this.companies.pipe(
      take(1),
      map(companies => {
        return {...companies.find(company => company.pk === pk)}
      }))
  }

  setCompanyName(name: string) {
    this._companyName.next(name);
  }

}
