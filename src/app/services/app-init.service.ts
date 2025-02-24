import { Injectable } from '@angular/core';
import { catchError, concat, defer, EMPTY, lastValueFrom, tap, timeout } from 'rxjs';
import { AuthService } from './auth.service';
import { Storage } from '@ionic/storage-angular';
import { SplashScreen } from '@capacitor/splash-screen';
import * as cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { Router } from '@angular/router';
import { CompanyService } from './company.service';
import { ApiTransportService } from './api-transport.service';
import { App } from '@capacitor/app';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private apiTransport: ApiTransportService,
    private storage: Storage,
    private router: Router,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private platform: Platform
    ) {}

  async loadConfig() {
    await this.storage.defineDriver(cordovaSQLiteDriver);
    await this.storage.create();
    await SplashScreen.hide(); // back button ignored when splash screen is visible

    await this.platform.ready().then(() => {
      if (this.platform.is('capacitor')) {
        StatusBar.setOverlaysWebView({ overlay: false });
      }
    });

    App.addListener ('backButton', data => {
      this.modalCtrl.getTop().then ((modal) => {
        if (modal) {
          modal.dismiss ();
        } else if (data.canGoBack) {
          this.navCtrl.back ();
        } else {
          App.exitApp ();
        }
      });
    });

    App.addListener ('pause', () => {
    });

    try {
      await this.authService.init ();
      await this.apiTransport.init ();
      await this.companyService.init ();
    } catch (err) {
      console.error ('init', err);
    }

    await SplashScreen.hide();

    if (this.authService.currentUser?.id) {
      if (!location.pathname.match(/\/private\//)) {
          this.router.navigateByUrl('/private/tabs/home');
      }
    } else {
        this.router.navigateByUrl('/auth');
    }

    return EMPTY;
  }
}
