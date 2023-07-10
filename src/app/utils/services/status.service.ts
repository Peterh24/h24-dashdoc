import { Injectable } from '@angular/core';
import { BehaviorSubject, map, take } from 'rxjs';
import { Status } from 'src/app/private/models/status.model';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private statusArray =
    [
      {key: 'done', value:'Terminé'},
      {key: 'declined', value: 'Annulé'}
    ]


  get status() {
    return this.statusArray;
  }

  getStatus(key: string) {
    return this.status.find(s => s.key === key).value;
  }

  constructor() { }
}
