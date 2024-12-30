import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  areAllValuesIdentical(array:any, propertyFirst:any, propertySecond:string) {

    if (array.length <= 0) {
      return false;
    }
    const currentVal = array?.[0]?.[propertyFirst]?.[propertySecond]?.[propertySecond];

    for (let i = 1; i < array.length; i++) {
      if (array?.[i]?.[propertyFirst]?.[propertySecond]?.[propertySecond] !== currentVal) {
        return false;
      }
    }
    return true;
  }

}
