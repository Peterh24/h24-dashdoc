import { Injectable } from '@angular/core';

interface Transport {
  segments: Array<
  {
    trailers:Array<{
      license_plate: string
    }
    >,
  }
  >,

}

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  originNb:number = 0;
  vehicle: {};
  trailers: Array<any> = [];
  deliveries: Array<any> = [];
  segments: Array<any> = [];
  transport: any = {};
  minDateOrigin: string;
  minHourOrigin: string;
  minDateDestination: string;
  minHourDestination: string;
  isEditMode = false;
  constructor() { }
}
