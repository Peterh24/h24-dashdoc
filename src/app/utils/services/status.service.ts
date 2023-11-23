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
      {key: 'declined', value: 'Annulé'},
      {key: 'accepted', value: 'Validé'},
      {key: 'ongoing', value: 'En cours'},
      {key: 'other', value: 'Autre'},
      {key: 'paid', value: 'Réglée'},
      {key: 'upcoming', value: 'En cours'},
      {key: 'cancelled', value: 'Annulée'},
      {key: 'ordered', value: 'En Attente'}
    ]


  get status() {
    return this.statusArray;
  }
  getStatus(key: string) {
    const statusItem = this.status.find(s => s.key === key);
    if (statusItem) {
      return statusItem.value;
    } else {
      const otherItem = this.status.find(s => s.key === 'other');
      if (otherItem) {
        return otherItem.value;
      } else {
        return null;
      }
    }
  }

  constructor() { }
}
