import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, take, tap } from 'rxjs';
import { Company } from '../private/models/company.model';
import { ApiTransportService } from './api-transport.service';
import { AuthService } from './auth.service';
import { Storage } from '@ionic/storage-angular';
import { DASHDOC_COMPANY } from './constants';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  public companies: Company[] = [];
  public currentCompany: Company;

  public companyStatusBadge: number;
  isCompanySwitch: boolean = false;

  constructor(
    private apiTransport: ApiTransportService,
    private authService: AuthService,
    private storage: Storage
  ) { }

  async init () {
    await firstValueFrom (this.fetchCompanies ());
    const company = await this.storage.get(DASHDOC_COMPANY);
    if (company) {
      this.setCurrentCompany (company);
    }
  }

  fetchCompanies () {
    const tokens = this.authService.currentUser?.tokens;

    return this.apiTransport.getCompanies (tokens || []).pipe(
      tap ((allCompanies: Company[]) => {
        this.companies = allCompanies;
      })
    )
  }

  getCompany(id: number) {
    return this.companies.find ((company: Company) => company.id == id);
  }

  getCompanyStatus () {
    this.apiTransport.getCompanyStatus().pipe(take(1)).subscribe({
      next: ((res:any) => {
        this.companyStatusBadge = res;
      })
    });
  }

  async setCurrentCompany(id: number) {
    return this.apiTransport.chooseCompany (id).pipe (
      tap ((res) => {
        this.currentCompany = this.getCompany (id);
      })
    )
  }
}
