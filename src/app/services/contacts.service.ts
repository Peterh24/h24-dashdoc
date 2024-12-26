import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL } from './constants';
import { EMPTY, expand, map, reduce, tap } from 'rxjs';
import { Contact } from '../private/profile/contacts/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {

  constructor(
    private http: HttpClient
  ) { }

  fetchContacts () {
    return this.http.get(`${DASHDOC_API_URL}contacts/`).pipe(
      expand ((res: any) => res.next ? this.http.get (res.next) : EMPTY),
      reduce ((acc: any, res: any) => acc.concat (res.results),  []),
      map ((acc: any) => acc.map ((contact: any, index: number) => new Contact (
        index,
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.phone_number,
        contact.company?.pk,
        contact.company?.name
      )))
    );
  }

  fetchContactsCompanies () {
    return this.http.get(`${DASHDOC_API_URL}companies/`).pipe(
      expand ((res: any) => res.next ? this.http.get (res.next) : EMPTY),
      reduce ((acc: any, res: any) => acc.concat (res.results),  []),
      map ((acc: any) => acc.map ((company: any) => (
        {
          pk: company.pk,
          name: company.name,
        }
      )))
    );
  }

}
