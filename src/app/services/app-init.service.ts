import { Injectable } from '@angular/core';
import { EMPTY } from 'rxjs';
import { AuthService } from './auth.service';
import { Storage } from '@ionic/storage-angular';
import { SplashScreen } from '@capacitor/splash-screen';
import * as cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { ConfigService } from './config.service';
import { COMPANIES_KEY, CURRENT_COMPANY } from './constants';
import { Router } from '@angular/router';
import { CompanyService } from './company.service';
import { ApiTransportService } from './api-transport.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private apiTransport: ApiTransportService,
    private storage: Storage,
    private config: ConfigService,
    private router: Router
    ) {}

  async loadConfig() {
    await this.storage.defineDriver(cordovaSQLiteDriver);
    await this.storage.create();

    try {
      await this.authService.init ();
      await this.apiTransport.init ();
      await this.companyService.init ();

      this.companyService.getCompanyStatus ();

      await SplashScreen.hide();

      if (this.authService.currentUser) {
          if (!location.pathname.match(/\/private\//)) {
              this.router.navigateByUrl('/private/tabs/home');
          }
      } else {
          this.router.navigateByUrl('/auth');
      }
    } catch(e) {
      console.error (e);
      this.authService.signOut ();
    }

    return EMPTY;
  }
}