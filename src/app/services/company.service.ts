import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take, tap } from 'rxjs';
import { Company } from '../private/models/company.model';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL } from './constants';

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
    private http: HttpClient
  ) { }

  getCompany() {

  }
}
