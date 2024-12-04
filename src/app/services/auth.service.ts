import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { API_URL, DASHDOC_COMPANY, FIREBASE_TOKEN_KEY, JWT_KEY, USER_STORAGE_KEY } from './constants';
import { BehaviorSubject, take, map, catchError, tap } from 'rxjs';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { ActionPerformed, PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { NavController, Platform } from '@ionic/angular';

export interface UserData {
  token: string;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //TODO: Set to true for debug please leave this property to false;
  userIsAuthenticated: boolean = false;

  private user: BehaviorSubject<UserData | null | undefined> = new BehaviorSubject<UserData | null | undefined>(undefined);
  currentUser: any;
  currentUserDetail: any;
  userInfo: any;
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private router: Router,
    private navCtrl: NavController,
    private platform: Platform
  ) {
    this.loadUser();
    this.initializeFirebasePushNotifications ();
  }

  async loadUser() {
    const data = await this.storage.get(JWT_KEY);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (data) {
      const decoded: any = jwt_decode(data);
      if (decoded.exp > currentTime) {
        const userData = {
          token: data,
          id: decoded.id
        }
        this.currentUser = decoded;
        this.user.next(userData);

        if (this.router.url.match(/^\/(auth)?$/)) {
          this.navCtrl.navigateRoot('/private/tabs/home');
        }
      } else {
        this.user.next(null);
        this.router.navigateByUrl('/auth');
      }
    } else {
      this.user.next(null); 
      this.router.navigateByUrl('/auth');
    }
  }

  register(firstname: string, lastname: string, phone: string, email: string, password: string, isClient:boolean) {
    return this.http.post(`${API_URL}app_users`, { firstname, lastname, phone, email, password, isClient }).pipe(
      map((res) => {

      })
    );
  }

  update(firstname: string, lastname: string, phone: string, email: string) {
    return this.http.put(`${API_URL}app_users/${this.currentUser.id}`, { firstname, lastname, phone, email}).pipe(
      map((res) => {

      })
    );
  }

  login(username: string, password: string) {
    this.storage.remove('DASHDOC_COMPANY');
    return this.http.post(`${API_URL}login`, { username, password }).pipe(
      map((res: any) => {
        this.storage.set(JWT_KEY, res.token);
        const decoded: any = jwt_decode(res.token); 
        const userData = {
          token: res.token,
          id: decoded.id
        };
        this.user.next(userData);
        this.currentUser = decoded;
        return userData;
      }),
      catchError((error: any) => {
        console.error('Erreur:', error);
        throw error;
      })
    );
  }

  loadCurrentUserDetail (userId: number) {
    return this.http.get(`${API_URL}app_users/${userId}`).pipe(take(1),
      tap ((userDetail: any) => {
        this.currentUserDetail = userDetail;

        // On renouvelle le token firebase tous les mois
        this.anacron('FIREBASE', 30 * 24 * 86400, () => {
          this.resetFirebasePushNotificationToken ();
        });
      }));
  }

  SetUserInfo(){
      this.http.get(`${API_URL}app_users/${this.currentUser.id}`).subscribe(res => {
        this.userInfo = res;
      });
  }

  async signOut(){
    await this.storage.remove(JWT_KEY);
    await this.storage.remove(USER_STORAGE_KEY);
    await this.storage.remove(DASHDOC_COMPANY);
    this.userIsAuthenticated = false;
    this.user.next(null);
    this.router.navigate(['/'], { replaceUrl: true });
  }

  supportsFirebaseNotifications () {
    return !this.platform.is('desktop') && !this.platform.is ('mobileweb');
  }

  removeAllDeliveredNotifications (){
    if (this.supportsFirebaseNotifications ()) {
      PushNotifications.removeAllDeliveredNotifications ();
    }
  }

  resetFirebasePushNotificationToken () {
    if (this.supportsFirebaseNotifications()) {
      this.storage.remove (FIREBASE_TOKEN_KEY).then ((value) => {
        this.registerFirebasePushNotifications ();
      });
    }
  }

  registerFirebasePushNotifications () {
    if (!this.supportsFirebaseNotifications()) {
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
  
  initializeFirebasePushNotifications () {
    if (!this.supportsFirebaseNotifications ()) {
      return;
    }

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token: Token) => {
      const savedToken = await this.storage.get (FIREBASE_TOKEN_KEY);

      const remoteTokenChanged = this.currentUserDetail?.firebase_token && this.currentUserDetail?.firebase_token != savedToken;
      const localTokenChanged = savedToken == null || savedToken != token?.value; 

      if (remoteTokenChanged || localTokenChanged) {
        const data = {id: this.currentUser.id, username: this.currentUser.username, token: token.value};
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
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push action performed', notification);
    });
  }

  // excecute la fonction callback quand le timer est dépassé
  async anacron (type: string, seconds: number, callback: Function) {
    const key = 'ANACRON_' + type;
    const lastRun = await this.storage.get (key);

    if (lastRun == null || new Date().valueOf() - lastRun > seconds * 1000) {
      this.storage.set (key, new Date().valueOf()).then ((value) => {
        callback ();
      })
    }
  }
}
