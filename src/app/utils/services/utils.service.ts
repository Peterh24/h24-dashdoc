import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private storage: Storage) { }

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

    // excecute la fonction callback quand le timer est dépassé
    async anacron (type: string, seconds: number, callback: Function) {
      const key = 'ANACRON_' + type;
      const lastRun = await this.storage.get (key);
  
      if (lastRun == null || new Date().valueOf() - lastRun > seconds * 1000) {
        this.storage.set (key, new Date().valueOf()).then ((value) => {
          callback ();
        })
      }
    }  
}
