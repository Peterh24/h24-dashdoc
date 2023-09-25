import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, concatMap, firstValueFrom, forkJoin, from, map, switchMap, take, tap, throwError, toArray } from 'rxjs';
import { Company } from '../private/models/company.model';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { DASHDOC_API_URL, USER_STORAGE_KEY } from './constants';
import { Storage } from '@ionic/storage-angular';
import { DashdocService } from './dashdoc.service';

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
    private dashdocService: DashdocService
  ) { }

  fetchCompanies() {
    this.dashdocService.fetchTokens().pipe(take(1)).subscribe((tokens) => {
      this.dashdocService.tokens.pipe(take(1)).subscribe(async tokens => {
        if (this._companies.getValue().length > 0) {
          return;
        }
        for (const token of tokens) {
          const tokenCurrent = token.token;
          const headers = new HttpHeaders().set('Authorization', `Token ${tokenCurrent}`);


          try {
            const resData: any = await firstValueFrom(this.http.get(`${DASHDOC_API_URL}addresses/`, { headers }));
            
            // Traitement des données si la requête réussit
            const newCompany = { ...resData.results[0].created_by, token: token.token };
            console.log('newCompany: ', newCompany);
          } catch (error) {
            if (error instanceof HttpErrorResponse) {
              if (error.status === 401) {
                // Traitement spécifique pour l'erreur 401 (Unauthorized)
                alert('votre token ' + token.token+ ' est incorect merci de le verifier dans votre interface dashdoc')
                // Vous pouvez choisir d'ajouter ce token à une liste de tokens invalides, par exemple
              } else {
                // Gérer d'autres erreurs HTTP si nécessaire
                console.error('Erreur HTTP:', error.status, error.statusText);
              }
            } else {
              // Gérer d'autres types d'erreurs si nécessaire
              console.error('Erreur inattendue:', error);
            }
          }
        }
      })
    });
    // this.dashdocService.fetchTokens().pipe(take(1)).subscribe((tokens) => {
    //   console
    //   this.dashdocService.tokens.pipe(take(1)).subscribe(async tokens => {
    //     if (this._companies.getValue().length > 0) {
    //       return;
    //     }
    //     for (const token of tokens) {
    //       const tokenCurrent = token.token;
  
    //       const headers = new HttpHeaders().set('Authorization', `Token ${tokenCurrent}`);
    //       const resData: any = await firstValueFrom(this.http.get(`${DASHDOC_API_URL}addresses/`, { headers }));
    //       const newCompany = { ...resData.results[0].created_by, token: token.token };
  
    //       if (!this._companies.getValue().includes(newCompany)) {
    //         this._companies.next([...this._companies.getValue(), newCompany]);
    //       }
    //     }
    //   });
    // });
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
