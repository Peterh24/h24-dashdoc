import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { API_URL, DASHDOC_COMPANY, JWT_KEY, USER_STORAGE_KEY } from './constants';
import { BehaviorSubject, delay, of, switchMap, take, map, catchError, filter, tap } from 'rxjs';
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
  userIsAuthenticated: boolean = false;

  private user: BehaviorSubject<UserData | null | undefined> = new BehaviorSubject<UserData | null | undefined>(undefined);
  currentUser: any;
  currentUserDetail: any;
  userInfo: any;
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private router: Router,
  ) {
    this.loadUser();
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

}
