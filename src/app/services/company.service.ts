import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take, tap } from 'rxjs';
import { Company } from '../private/models/company.model';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL } from './constants';
import { Storage } from '@ionic/storage-angular';
import { DashdocService } from './dashdoc.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private _companies = new BehaviorSubject<Array<Company>>([
    new Company(1, 'Nike'),
    new Company(2, 'TF1'),
    new Company(3, 'H24 Transports')
  ]);

  get companies() {
    return this._companies.asObservable();
  }
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private dashdocService: DashdocService
  ) { }

  fetchCompanies() {
    this.dashdocService.tokens.pipe(take(1)).subscribe(tokens => {
      tokens.forEach(token => {
        this.storage.set(DASHDOC_API_URL, token.token);

        this.http.get(`${DASHDOC_API_URL}addresses`).pipe((tap(resData => {
          console.log('resData: ', resData);
        })))
      })
    })

  }

  getCompany() {

  }
}
