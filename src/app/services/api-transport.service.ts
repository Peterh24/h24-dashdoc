import { Injectable } from '@angular/core';
import { ApiTransportDashdoc } from './api-transport-dashdoc';

@Injectable({
  providedIn: 'root'
})
export class ApiTransportService extends ApiTransportDashdoc {

  constructor() { 
    super();
  }
}
