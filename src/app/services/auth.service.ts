import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { API_URL, JWT_KEY, USER_STORAGE_KEY } from './constants';
import { BehaviorSubject, delay, of, switchMap, take, map, catchError } from 'rxjs';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';

export interface UserData {
  token: string;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //TODO: Set to true for debug please leave this property to false;
  userIsAuthenticated: boolean = true;

  private user: BehaviorSubject<UserData | null | undefined> = new BehaviorSubject<UserData | null | undefined>(undefined);

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private router: Router
  ) {
    this.loadUser();
  }

  async loadUser() {
    const data = await this.storage.get(JWT_KEY);
    const currentTime = Math.floor(Date.now() / 1000);
    if (data) {
      const decoded: any = jwt_decode(data);
      if(decoded.exp > currentTime){
        const userData = {
          token: data,
          id: decoded.sub
        }
        this.user.next(userData);
      } else {
        this.user.next(null);
        this.router.navigateByUrl('/auth');
      }

    } else {
      this.user.next(null);
      this.router.navigateByUrl('/auth');
    }
  }

  register(firstname: string, lastname: string, phone: string, email: string, password: string) {
    return this.http.post(`${API_URL}/app_users`, { firstname, lastname, phone, email, password }).pipe(
      map((res) => {

      })
    );
  }

  login(username: string, password: string) {
    return this.http.post(`${API_URL}/login`, { username, password }).pipe(
      map((res: any) => {
        console.log(res);
        this.storage.set(JWT_KEY, res.token); // Assurez-vous que le service de stockage est correctement configuré
        const decoded: any = jwt_decode(res.token); // Assurez-vous que jwt_decode est correctement importé
        const userData = {
          token: res.token,
          id: decoded.sub
        };
        this.user.next(userData);
        return userData;
      }),
      catchError((error: any) => {
        console.error('Erreur:', error);
        throw error;
      })
    );
  }

  // FAKE API SIMULATION JUST FOR TESTING NOT USE THIS IN PRODUCTION
  // login(email: string, password: string) {
  //   const userData = {
  //     token: 'd279f42372b01e95b7ff5a88fc71cd972dcd09d7',
  //     id: 'someUserId',
  //   };
  //   this.storage.set(JWT_KEY, userData.token);
  //   this.user.next(userData);
  //   this.userIsAuthenticated = true;
  //   return of(userData).pipe(delay(1000));
  // }

  async signOut(){
    await this.storage.remove(JWT_KEY);
    this.userIsAuthenticated = false;
    this.router.navigateByUrl('/');
    this.user.next(null);
  }

  getCurrentUser() {
    return this.user.asObservable();
  }

  getCurrentUserId() {
    return this.user.getValue()!.id;
  }
}
