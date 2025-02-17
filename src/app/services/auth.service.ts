import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { DASHDOC_COMPANY, JWT_KEY, USER_STORAGE_KEY } from './constants';
import { take, map, catchError, tap } from 'rxjs';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { UtilsService } from '../utils/services/utils.service';
import { ApiTransportService } from './api-transport.service';
import { NotificationsService } from './notifications.service';
import { User } from '../private/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User;

  constructor(
    private storage: Storage,
    private router: Router,
    private apiTransport: ApiTransportService,
    private notifications: NotificationsService,
    private utils: UtilsService
  ) {
    // TODO: this.notifications.initialize ();
  }

  async init() {
    const data = await this.storage.get(JWT_KEY);
    const currentTime = Math.floor(Date.now() / 1000);

    if (data) {
      const decoded: any = jwt_decode(data);
      if (decoded.exp > currentTime) {
        this.currentUser = new User(decoded.id, decoded.username, null, null, null, decoded.companny);
      }
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
    return this.apiTransport.changeUserPassword (this.currentUser.id, this.currentUser.email, password, newpassword);
  }

  login(username: string, password: string) {
    this.storage.remove('DASHDOC_COMPANY');
    return this.apiTransport.loginUser(username, password).pipe(
      map((res: any) => {
        this.storage.set(JWT_KEY, res.token);
        const decoded: any = jwt_decode(res.token);
        this.currentUser = new User(decoded.id, decoded.username, null, null, null, decoded.companny);
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
        this.currentUser.first_name = userDetail.first_name;
        this.currentUser.last_name = userDetail.last_name;
        this.currentUser.phone_number = userDetail.phone_number;

        // On renouvelle le token firebase tous les mois
        this.utils.anacron('FIREBASE', 30 * 24 * 86400, () => {
          this.notifications.resetToken ();
        });
      }));
  }

  async signOut(){
    await this.storage.remove(JWT_KEY);
    await this.storage.remove(USER_STORAGE_KEY);
    await this.storage.remove(DASHDOC_COMPANY);
    this.currentUser = null;
    this.router.navigate(['/'], { replaceUrl: true });
  }
}
