import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL } from './constants';
import { BehaviorSubject, EMPTY, expand, map, Observable, of, reduce, switchMap, take, tap } from 'rxjs';
import { Contact } from '../private/profile/contacts/contact.model';
import { ApiTransportService } from './api-transport.service';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  protected contacts: BehaviorSubject<Contact[]> = new BehaviorSubject([]);
  contacts$: Observable<any[]> = this.contacts;

  constructor(
    private http: HttpClient,
    private apiTransport: ApiTransportService
  ) { }

  fetchContacts () {
    return this.apiTransport.getContacts ().pipe(
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
    return this.apiTransport.getContactsCompanies ();
  }

  addContact(first_name: string, last_name: string, email: string, phone_number: string, company: string, company_name: string) {
    const contact = { first_name, last_name, email, phone_number, company: { pk: company }, company_name } // TODO
    return this.apiTransport.createContact(contact).pipe(
      take(1),
      tap((newContact: Contact) => {
        const updatedContacts = [...this.contacts.value, newContact];
        this.contacts.next(updatedContacts);
      })  
    );
  }

  updateContact(uid: string, first_name: string, last_name: string, email: string, phone_number: string, company: string, company_name: string) {
    const contact = { first_name, last_name, email, phone_number, company: { pk: company }, company_name } // TODO
    return this.apiTransport.updateContact(uid, contact).pipe(
      take(1),
      tap((updatedContact: Contact) => {
        const updatedContactIndex = this.contacts.value.findIndex (c => c.uid === uid);
        const updatedContacts = [...this.contacts.value ];
        updatedContacts[updatedContactIndex] = updatedContact;
        this.contacts.next(updatedContacts);
        return updatedContact;
      })
    );
  }

  removeContact(uid: string) {
    return this.apiTransport.deleteContact(uid).pipe(
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
