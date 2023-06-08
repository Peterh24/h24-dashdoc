import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DashdocToken } from '../private/models/dashdoc-token.model';

@Injectable({
  providedIn: 'root'
})
export class DashdocService {
  private _tokens = new BehaviorSubject<Array<DashdocToken>>([
    new DashdocToken('Token1', '82c37b96a444bc266ea1c0594570c847e2c94a67'),
    new DashdocToken('Token2', 'd279f42372b01e95b7ff5a88fc71cd972dcd09d7'),
  ]);

  get tokens() {
    return this._tokens.asObservable();
  }
  constructor() { }
}
