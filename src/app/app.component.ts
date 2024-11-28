import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { SplashScreen } from '@capacitor/splash-screen';
import { register } from 'swiper/element/bundle';
import { NavController, Platform } from '@ionic/angular';
import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';

register();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
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

    /*
    App.addListener ('backButton', data => {
      console.log ("backButton", data.canGoBack);
      
      if (data.canGoBack) {
        this.navCtrl.back ();
      } else {
        App.exitApp ();
      }
    });
    */
   
    // TODO: enlever la notofication quand l'utlisateur visite la 
    // page concernée
    App.addListener ('pause', () => {
      this.removeAllDeliveredNotifications ();
    });
  }

  removeAllDeliveredNotifications () {
    if (!this.platform.is('desktop') && !this.platform.is ('mobileweb')) {
      PushNotifications.removeAllDeliveredNotifications ();
    }
  }
}
