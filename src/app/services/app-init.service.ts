import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, filter, firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { Storage } from '@ionic/storage-angular';
import { SplashScreen } from '@capacitor/splash-screen';
import * as cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { ConfigService } from './config.service';
import { DASHDOC_COMPANY } from './constants';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private storage: Storage,
    private config: ConfigService,
    private router: Router
    ) {}

  async loadConfig() {
    await this.storage.defineDriver(cordovaSQLiteDriver);
    await this.storage.create();
    
    const company = await this.storage.get(DASHDOC_COMPANY);
    this.config.setCurrentCompany (company);

    await this.authService.loadUser ();
    await SplashScreen.hide();

    if (this.authService.currentUser) {
        if (location.pathname.match(/^\/(auth)?$/)) {
            this.router.navigateByUrl('/private/tabs/home');
        }                
    } else {
        this.router.navigateByUrl('/auth');
    }

    return EMPTY;
  }
}