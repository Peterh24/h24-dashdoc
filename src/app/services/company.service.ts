import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, concatMap, firstValueFrom, forkJoin, from, map, switchMap, take, tap, throwError, toArray } from 'rxjs';
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
    this.dashdocService.tokens.pipe(take(1)).subscribe(async tokens => {
      if (this._companies.getValue().length > 0) {
        return;
      }

      for (const token of tokens) {
        const tokenCurrent = token.token;
        await this.storage.set(USER_STORAGE_KEY, tokenCurrent);
        const resData: any = await firstValueFrom(this.http.get(`${DASHDOC_API_URL}addresses/`));
        const newCompany = {...resData.results[0].created_by, token: token.token};

        if (!this._companies.getValue().includes(newCompany)) {
          this._companies.next([...this._companies.getValue(), newCompany]);
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
