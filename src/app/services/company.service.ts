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
    this.dashdocService.tokens.subscribe(async tokens => {
      const sendRequest = async (index: number) => {
        if (index >= tokens.length) {
          return;
        }

        const token = tokens[index].token;
        this.storage.set(USER_STORAGE_KEY, token);

        try {
          const response: any = await firstValueFrom(this.http.get(`${DASHDOC_API_URL}addresses`));

          const newCompany = {...response.results[0].created_by, token: token};
          const companiesArray = this._companies.getValue();

          if (!companiesArray.includes(newCompany)) {
            this._companies.next([...companiesArray, newCompany]);
          }
        } catch (error) {
          console.error('Erreur lors de l\'appel API:', error);
        }

        await sendRequest(index + 1);
      };

      await sendRequest(0);
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
