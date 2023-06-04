import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { API_URL, USER_STORAGE_KEY } from './constants';
import { BehaviorSubject, delay, of, switchMap } from 'rxjs';
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
    //WAITING FOR REAL API
    //
    //this.loadUser();
  }

  async loadUser() {
    const data = await this.storage.get(USER_STORAGE_KEY);
    console.log('FROM STORAGE: ', data)
    if (data) {
      const decoded: any = jwt_decode(data);
      const userData = {
        token: data,
        id: decoded.sub
      }
      this.user.next(userData)
    } else {
      this.user.next(null);
    }
  }

  register(firstname: string, lastname:string, phone: string, email: string) {
    return this.http.post(`${API_URL}/register`, { firstname, lastname, phone, email }).pipe(
      switchMap(() => {
        return this.login(email, 'password')
      })
    );
  }

  //WE WAITING FOR REAL API
  //
  // login(email: string, password:string) {
  //   return this.http.post(`${API_URL}/auth`, { email, password }).pipe(
  //     map((res: any) => {
  //       this.storage.set(USER_STORAGE_KEY, res.token);
  //       const decoded: any = jwt_decode(res.token);
  //       const userData = {
  //         token: res.token,
  //         id: decoded.sub
  //       }
  //       this.user.next(userData);
  //       return userData;
  //     })
  //   )
  // }

  // FAKE API SIMULATION JUST FOR TESTING NOT USE THIS IN PRODUCTION
  login(email: string, password: string) {
    const userData = {
      token: 'ONVAMETTRELETOKENICI',
      id: 'someUserId',
    };
    this.storage.set(USER_STORAGE_KEY, userData.token);
    this.user.next(userData);
    this.userIsAuthenticated = true;
    return of(userData).pipe(delay(1000));
  }

  async signOut(){
    await this.storage.remove(USER_STORAGE_KEY);
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
