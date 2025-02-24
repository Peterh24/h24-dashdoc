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
import { ModalController, NavController } from '@ionic/angular';

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
    ) {}

  async loadConfig() {
    await this.storage.defineDriver(cordovaSQLiteDriver);
    await this.storage.create();

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

    await lastValueFrom (concat(
      defer (() => this.authService.init ()),
      defer (() => this.apiTransport.init ()),
      defer (() => this.companyService.init ())
    ).pipe (
        timeout (8000),
        tap ((res) => {
        }),
        catchError ((error) => {
          console.error ('init', error);
          return EMPTY;
        })
    ));

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
