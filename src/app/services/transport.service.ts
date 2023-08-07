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
  transport: Transport = {
    segments: []
  };
  constructor() { }
}
