import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take } from 'rxjs';
import { Company } from '../private/models/company.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DASHDOC_API_URL } from './constants';
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
    private dashdocService: DashdocService,
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
          
          this.http.get(`${DASHDOC_API_URL}addresses/`, { headers }).pipe(take(1)).subscribe(((res:any) => {
            
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

  addCompany(token:number) {
    const headers = new HttpHeaders().set('Authorization', `Token ${token}`);
    this.http.get(`${DASHDOC_API_URL}addresses/`, { headers }).pipe(take(1)).subscribe(((res:any) => {
      if(res.results !== undefined ){
        const newCompany = { ...res.results[0].created_by, token: token };
        if (!this._companies.getValue().includes(newCompany)) {
          this._companies.next([...this._companies.getValue(), newCompany]);
        }
      }
    }))
  }

  setCompanyName(name: string) {
    this._companyName.next(name);
  }

}
