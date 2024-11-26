import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { SplashScreen } from '@capacitor/splash-screen';
import { register } from 'swiper/element/bundle';
import { NavController, Platform } from '@ionic/angular';
import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';

register();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private router: Router,
    private navCtrl: NavController,
    private storage: Storage, 
    private platform: Platform,
  ) {
    this.init();
  }

  async init() {
    await this.storage.defineDriver(CordovaSQLiteDriver);
    await this.storage.create();
    await SplashScreen.hide();

    this.removeAllDeliveredNotifications ();

    // TODO: enlever la notofication quand l'utlisateur visite la 
    // page concernée
    this.platform.pause.subscribe(async () => {
      this.removeAllDeliveredNotifications ();
    });

    document.addEventListener('ionBackButton', (ev:any) => {
      ev.detail.register(1, () => {
        if (this.router.url == '/' || this.router.url == '/auth' || this.router.url == '/private/tabs/home') {
          App.exitApp ();
        } else {
          this.navCtrl.back ();
        }
      });
    });
  }

  removeAllDeliveredNotifications () {
    if (!this.platform.is('desktop') && !this.platform.is ('mobileweb')) {
      PushNotifications.removeAllDeliveredNotifications ();
    }
  }
}
