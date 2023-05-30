import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private _storedData: BehaviorSubject<any> = new BehaviorSubject<string>(null);

  get storedData() {
    return this._storedData.asObservable();
  }
  constructor(
    private storage:Storage
  ) {
    this.init();
  }

  async init(){
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async getData(key: string) {
    const value = await this.storage.get(key);
    return value;

  }

  addData(key: string, value:string) {
    this._storage.set(key, value);
  }

  removeData(key: string) {
    this._storage?.remove(key);
  }
}
