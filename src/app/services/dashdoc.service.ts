import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, map, take } from 'rxjs';
import { DashdocToken } from '../private/models/dashdoc-token.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashdocService {
  private _tokens = new BehaviorSubject<Array<DashdocToken>>([]);

  get tokens() {
    return this._tokens.asObservable();
  }
  constructor(
    private authService: AuthService,
  ) { }


  fetchTokens(): Observable<void> {
    const tokens = this.authService.currentUserDetail.appDashdocTokens.map((token:any) => {
      return new DashdocToken(token['@id'], token.token);
    });
    this._tokens.next(tokens);
    
    return EMPTY;
  }

}
