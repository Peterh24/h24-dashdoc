import { Injectable } from '@angular/core';
import { ApiTransportH24v2 } from './api-transport-h24v2';

@Injectable({
  providedIn: 'root'
})
export class ApiTransportService extends ApiTransportH24v2 {

  constructor() {
    super();
  }
}
