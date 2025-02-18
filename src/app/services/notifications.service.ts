import { Injectable } from '@angular/core';
import { ActionPerformed, PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { FIREBASE_TOKEN_KEY } from './constants';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  initialized: boolean;
  notifications: any[] = [ // TODO: delete this
    { title: 'Notification 1', body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi, fugit dolorum sint non recusandae magnam! Sequi hic cum magni qidem?'}
  ];

  constructor(
    private platform: Platform,
    private storage: Storage,
    private http: HttpClient
  ) { }

  // TODO: créee notification.service.ts
  isSupported () {
    return this.platform.is('capacitor');
  }

  removeAll (){
    if (this.isSupported ()) {
      PushNotifications.removeAllDeliveredNotifications ();
    }
  }

  resetToken () {
    if (this.isSupported()) {
      this.storage.remove (FIREBASE_TOKEN_KEY).then ((value) => {
        this.register ();
      });
    }
  }

  update () {
    if (this.isSupported ()) {
      PushNotifications.getDeliveredNotifications ().then (d => {
        this.notifications = d.notifications;
      });
    }
  }

  register () {
    if (!this.isSupported()) {
      return;
    }

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        // Show some error
      }
    });
  }

  initialize (username: string) {
    if (!username || !this.isSupported () || this.initialized) {
      return;
    }

    this.initialized = true;

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token: Token) => {
      const savedToken = await this.storage.get (FIREBASE_TOKEN_KEY);

      const remoteTokenChanged = false; //currentUserDetail?.firebase_token && currentUserDetail?.firebase_token != savedToken;
      const localTokenChanged = savedToken == null || savedToken != token?.value;

      if (remoteTokenChanged || localTokenChanged) {
        const data = { username, token: token.value }; // TODO check !
        // TODO: cgt url pour l'enregistrement des tokens
        this.http.post ('https://orbiteur.fr/h24/notifications/register.php', data).pipe (take(1)).subscribe ({
          next: (result) => {
            this.storage.set (FIREBASE_TOKEN_KEY, token.value);
          },
          error: (error) => {
            console.log (error);
          }
        })
      }
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration', error);
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      // TODO: show notification to user
      console.log('Push received', notification);
      this.update ();
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push action performed', notification);
      this.update ();
    });
  }

  reset () {
    this.notifications = [];

    if (this.isSupported ()) {
      PushNotifications.removeAllDeliveredNotifications ();
    }
  }
}
