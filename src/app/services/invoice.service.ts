import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Observable, from, map, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(
    private http: HttpClient,
    private storage: Storage,
  ) { }


  fetchInvoices(): Observable<any> {
    return from(this.storage.get('DASHDOC_COMPANY')).pipe(
      switchMap(companyPk => {
        const headers = new HttpHeaders().set('Authorization', `Token 31655b74ee8a65cc933b5b00bc1d085fa11f2fb5`);
        return this.http.get(`https://api.dashdoc.eu/api/v4/companies/${companyPk}/`, { headers }).pipe(
          map(resData => {
            return resData;
          }),
          tap((remoteId:any) => {
            const invoiceId = remoteId.invoicing_remote_id;
            const filter = [{"field": "customer_id", "operator": "eq", "value": invoiceId}]
            const filterString = JSON.stringify(filter);
            const encodedFilter = encodeURIComponent(filterString);
            const headers = new HttpHeaders().set('authorization', `Bearer 9vPF8rbIvtMoksQyhVBLWtqwjYflTx9z4-LCqZ2PFwY`);
            this.http.get(`https://app.pennylane.com/api/external/v1/customer_invoices?filter=${encodedFilter}`, { headers }).subscribe(
              resData => {
                console.log('Penny Data: ', resData);
              }
            )
            console.log('remoteId: ', invoiceId)
          })
        );
      })
    );
  }
}
