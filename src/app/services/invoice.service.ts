import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable, from, map, switchMap, tap } from 'rxjs';
import { Customer, Invoice, Item } from '../private/profile/invoice/invoice.model';
import { API_URL } from './constants';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private _invoices = new BehaviorSubject<Array<Invoice>>([]);
  get deliveries() {
    return this._invoices.asObservable();
  }
  constructor(
    private http: HttpClient,
    private storage: Storage,
  ) { }


  fetchInvoices(): Observable<Invoice[]> {
    return from(this.storage.get('DASHDOC_COMPANY')).pipe(
      switchMap(companyPk => {
        return this.http.get(`${API_URL}invoices/${companyPk}`).pipe(
          map((resData: any) => {
            const invoices: Invoice[] = [];
            resData.invoices.forEach((jsonData: any) => {
              const items: Item[] = jsonData.line_items.map((lineItem: any) => ({
                label: lineItem.label,
                amount: lineItem.amount
              }));

              const customer: Customer = {
                address: jsonData.customer.billing_address.address,
                postal_code: jsonData.customer.billing_address.postal_code,
                city: jsonData.customer.billing_address.city,
                country_alpha2: jsonData.customer.billing_address.country_alpha2
              };

              const invoice: Invoice = new Invoice(
                jsonData.id,
                jsonData.invoice_number,
                jsonData.currency_amount_before_tax,
                jsonData.amount,
                jsonData.currency,
                jsonData.status,
                jsonData.file_url,
                jsonData.filename,
                jsonData.date,
                customer,
                items
              );

              invoices.push(invoice);
            });

            return invoices;
          })
        );
      })
    );
  }

  resetInvoices() {
    this._invoices.next([]);
  }
}
