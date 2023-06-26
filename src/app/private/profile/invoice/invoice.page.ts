import { Component, OnInit } from '@angular/core';
import { InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.page.html',
  styleUrls: ['./invoice.page.scss'],
})
export class InvoicePage implements OnInit {

  constructor(
    private invoiceService: InvoiceService
  ) { }

  ngOnInit() {
    this.invoiceService.fetchInvoices().subscribe(invoices => {
      console.log('les invoices: ', invoices)
    })
  }

}
