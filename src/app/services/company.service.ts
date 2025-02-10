import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take, tap } from 'rxjs';
import { Company } from '../private/models/company.model';
import { ApiTransportService } from './api-transport.service';
import { AuthService } from './auth.service';
import { DashdocToken } from '../private/models/dashdoc-token.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private _companies = new BehaviorSubject<Array<Company>>([]);
  private _companyName = new BehaviorSubject<string>('');
  private _userHasChooseCompany = new BehaviorSubject<boolean>(false);
  public companyStatusBadge: number;
  isCompanySwitch: boolean = false;

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
    private apiTransport: ApiTransportService,
    private authService: AuthService
  ) { }

  fetchCompanies () {
    const tokens = this.authService.currentUserDetail?.tokens;

    return this.apiTransport.getCompanies (tokens || []).pipe(
      tap ((allCompanies: any) => this._companies.next (allCompanies))
    )
  }

  getCompany(pk: number) {
    return this.companies.pipe(
      take(1),
      map(companies => {
        return {...companies.find(company => company.pk === pk)}
      }))
  }

  getCompanyStatus () {
    this.apiTransport.getCompanyStatus().pipe(take(1)).subscribe({
      next: ((res:any) => {
        this.companyStatusBadge = res;
      })
    });
  }

  setCompanyName(name: string) {
    this._companyName.next(name);
  }

}
