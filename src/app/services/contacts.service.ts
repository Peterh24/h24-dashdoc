import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL } from './constants';
import { BehaviorSubject, EMPTY, expand, map, Observable, of, reduce, switchMap, take, tap } from 'rxjs';
import { Contact } from '../private/profile/contacts/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  protected contacts: BehaviorSubject<Contact[]> = new BehaviorSubject([]);
  contacts$: Observable<any[]> = this.contacts;

  constructor(
    private http: HttpClient
  ) { }

  fetchContacts () {
    return this.http.get(`${DASHDOC_API_URL}contacts/`).pipe(
      expand ((res: any) => res.next ? this.http.get (res.next) : EMPTY),
      reduce ((acc: any, res: any) => acc.concat (res.results),  []),
      map ((acc: any) => acc.map ((contact: any, index: number) => new Contact (
        contact.uid,
        contact.first_name,
        contact.last_name,
        contact.email,
        contact.phone_number,
        contact.company?.pk,
        contact.company?.name
      ))),
      tap ((contacts) => {
        this.contacts.next (contacts);
      })
    );
  }

  getContact(id: any) {
    return this.contacts.pipe(
      take(1),
      map(address => {
        return address.find(a => a.uid === id);
      })
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

  addContact(first_name: string, last_name: string, email: string, phone_number: string, company: string, company_name: string) {
    const dataApi = { first_name, last_name, email, phone_number, company: { pk: company } }
    return this.http.post(`${DASHDOC_API_URL}contacts/`, dataApi).pipe(
      take(1),
      map((resData: any) => {
        const newContact = new Contact (resData.uid, first_name, last_name, email, phone_number, company, company_name );
        const updatedContacts = [...this.contacts.value, newContact];
        this.contacts.next(updatedContacts);
        return newContact;
      })
    );
  }

  updateContact(uid: string, first_name: string, last_name: string, email: string, phone_number: string, company: string, company_name: string) {
    const dataApi = { first_name, last_name, email, phone_number, company: { pk: company } }
    return this.http.patch(`${DASHDOC_API_URL}contacts/${uid}/`, dataApi).pipe(
      take(1),
      map((resData: any) => {
        const updatedContactIndex = this.contacts.value.findIndex (c => c.uid === uid);
        const updatedContact = new Contact (uid, first_name, last_name, email, phone_number, company, company_name );
        const updatedContacts = [...this.contacts.value ];
        updatedContacts[updatedContactIndex] = updatedContact;
        this.contacts.next(updatedContacts);
        return updatedContact;
      })
    );
  }

  removeContact(uid: string) {
    return this.http.delete(`${DASHDOC_API_URL}contacts/${uid}/`).pipe(
      take(1),
      map((resData: any) => {
        const updatedContacts = this.contacts.value.filter ((contact) => contact.uid != uid);
        this.contacts.next(updatedContacts);
        return true;
      })
    );
  }

  resetContacts () {
    this.contacts.next ([]);
  }
}
