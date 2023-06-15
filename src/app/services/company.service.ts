import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, take, tap } from 'rxjs';
import { Company } from '../private/models/company.model';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL, USER_STORAGE_KEY } from './constants';
import { Storage } from '@ionic/storage-angular';
import { DashdocService } from './dashdoc.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private _companies = new BehaviorSubject<Array<Company>>([]);
  private _companyName = new BehaviorSubject<string>('');

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
    this.dashdocService.tokens.pipe(take(1)).subscribe(async tokens => {
      for (const token of tokens) {
        const tokenCurrent = token.token;
        await this.storage.set(USER_STORAGE_KEY, tokenCurrent);
        const resData: any = await firstValueFrom(this.http.get(`${DASHDOC_API_URL}addresses`));
        const newCompany = {...resData.results[0].created_by, token: token};
        const companiesArray = this._companies.getValue();
        if (!companiesArray.includes(newCompany)) {
          this._companies.next([...companiesArray, newCompany]);
        }
      }
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
