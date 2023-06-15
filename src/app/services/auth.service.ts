import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { API_URL, USER_STORAGE_KEY } from './constants';
import { BehaviorSubject, delay, of, switchMap, take, tap } from 'rxjs';
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
  private _userHasChooseCompany = new BehaviorSubject<boolean>(false);
  private user: BehaviorSubject<UserData | null | undefined> = new BehaviorSubject<UserData | null | undefined>(undefined);

  get userHasChooseCompany() {
    return this._userHasChooseCompany.asObservable();
  }

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
      token: 'd279f42372b01e95b7ff5a88fc71cd972dcd09d7',
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

  switchChooseCompanyState(state: boolean) {
    return this.userHasChooseCompany.pipe(take(1), tap(res => {
      const newState = state;
      console.log('state of res: ', newState);
      this._userHasChooseCompany.next(newState);
    }))
  }
}
