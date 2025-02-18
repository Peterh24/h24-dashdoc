import { Injectable } from '@angular/core';
import { map, take, tap } from 'rxjs';
import { ApiTransportService } from './api-transport.service';
import { Contact } from '../private/models/transport.model';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  contacts: Contact[] = [];

  constructor(
    private apiTransport: ApiTransportService
  ) { }

  fetchContacts () {
    return this.apiTransport.getContacts ().pipe(
      tap ((contacts) => {
        this.contacts = contacts;
      })
    );
  }

  getContact(id: any) {
    return this.contacts.find ((contact) => contact.id == id);
  }

  fetchContactsCompanies () {
    return this.apiTransport.getContactsCompanies ();
  }

  addContact(first_name: string, last_name: string, email: string, phone_number: string, company: number, company_name: string) {
    const contact = { first_name, last_name, email, phone_number, company, company_name } // TODO
    return this.apiTransport.createContact(contact).pipe(
      take(1),
      tap((newContact: Contact) => {
        this.contacts.push (newContact);
      })
    );
  }

  updateContact(id: string, first_name: string, last_name: string, email: string, phone_number: string, company: number, company_name: string) {
    const contact = { first_name, last_name, email, phone_number, company, company_name } // TODO
    return this.apiTransport.updateContact(id, contact).pipe(
      take(1),
      tap((updatedContact: Contact) => {
        if (updatedContact) {
          const index = this.contacts.findIndex (c => c.id == id);
          this.contacts[index] = updatedContact;
        }
      })
    );
  }

  removeContact(id: string) {
    return this.apiTransport.deleteContact(id).pipe(
      take(1),
      map((resData: any) => {
        this.contacts = this.contacts.filter ((contact) => contact.id != id);
      })
    );
  }

  resetContacts () {
    this.contacts = [];
  }
}
