import { Component, HostListener } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { SplashScreen } from '@capacitor/splash-screen';
import { register } from 'swiper/element/bundle';
import { ModalController, NavController, Platform } from '@ionic/angular';
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
    private modalCtrl: ModalController
  ) {
    this.init();
  }

  async init() {
    await this.storage.defineDriver(CordovaSQLiteDriver);
    await this.storage.create();
    await SplashScreen.hide();

    this.removeAllDeliveredNotifications ();

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
