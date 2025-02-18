import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, firstValueFrom, map, take, tap } from 'rxjs';
import { Company } from '../private/models/company.model';
import { ApiTransportService } from './api-transport.service';
import { AuthService } from './auth.service';
import { Storage } from '@ionic/storage-angular';
import { COMPANIES_KEY, DASHDOC_COMPANY } from './constants';

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
    try {
      if (this.authService.currentUser?.id) {
        this.companies = await this.storage.get (`${COMPANIES_KEY}_${this.authService.currentUser.id}`);
      }
      if (!this.companies) {
        await firstValueFrom (this.fetchCompanies ());
      }
      const company = await this.storage.get(DASHDOC_COMPANY);
      if (company && this.getCompany(company)) {
        await firstValueFrom (this.setCurrentCompany (company));
      } else {
        await this.storage.remove(DASHDOC_COMPANY);
        await firstValueFrom (this.fetchCompanies ());
      }
    } catch(e) {
      console.error (e);
    }
  }

  fetchCompanies () {
    const tokens = this.authService.currentUser?.tokens;

    return this.apiTransport.getCompanies (tokens || []).pipe(
      tap ((allCompanies: Company[]) => {
        this.companies = allCompanies;
        this.storage.set (`${COMPANIES_KEY}_${this.authService.currentUser.id}`, allCompanies);
      }),
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

  setCurrentCompany(id: number) {
    return this.apiTransport.chooseCompany (id).pipe (
      tap ((res) => {
        this.currentCompany = this.getCompany (id);
      })
    )
  }
}
