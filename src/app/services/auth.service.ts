import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { API_URL, DASHDOC_COMPANY, FIREBASE_TOKEN_KEY, JWT_KEY, USER_STORAGE_KEY } from './constants';
import { BehaviorSubject, take, map, catchError, tap, mergeMap, of } from 'rxjs';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { ActionPerformed, PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { NavController, Platform } from '@ionic/angular';
import { UtilsService } from '../utils/services/utils.service';
import { DashdocToken } from '../private/models/dashdoc-token.model';
import { ApiTransportService } from './api-transport.service';
import { NotificationsService } from './notifications.service';

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
    private platform: Platform,
    private apiTransport: ApiTransportService,
    private notifications: NotificationsService,
    private utils: UtilsService
  ) {
    // TODO: this.notifications.initialize ();
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
      } else {
        this.user.next(null);
      }
    } else {
      this.user.next(null); 
    }
  }

  register(firstname: string, lastname: string, phone: string, email: string, password: string, isClient:boolean, company: string = null) {
    const companies = company ? [ company ] : null;

    return this.apiTransport.createUser({ firstname, lastname, phone, email, password, isClient, company: companies }).pipe(
      map((res) => {

      })
    );
  }

  update(firstname: string, lastname: string, phone: string, email: string) {
    return this.apiTransport.updateUser(this.currentUser.id, { firstname, lastname, phone, email}).pipe(
      map((res) => {

      })
    );
  }

  resetPasswordRequest (email: string) {
    return this.apiTransport.resetUserPasswordRequest (email);
  }

  changePassword (password: string, newpassword: string) {
    return this.apiTransport.changeUserPassword (this.currentUser.id, this.currentUser.username, password, newpassword);
  }

  login(username: string, password: string) {
    this.storage.remove('DASHDOC_COMPANY');
    return this.apiTransport.loginUser(username, password).pipe(
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
    return this.apiTransport.getUserInfos(userId).pipe(take(1),
      tap ((userDetail: any) => {
        this.currentUserDetail = userDetail;

        // On renouvelle le token firebase tous les mois
        this.utils.anacron('FIREBASE', 30 * 24 * 86400, () => {
          this.notifications.resetToken ();
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
    this.currentUser = null;
    this.router.navigate(['/'], { replaceUrl: true });
  }
}
