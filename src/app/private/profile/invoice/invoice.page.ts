import { Component, OnInit, ViewChild } from '@angular/core';
import { InvoiceService } from 'src/app/services/invoice.service';
import { Invoice } from './invoice.model';
import { IonInfiniteScroll, IonSegment } from '@ionic/angular';
import { StatusService } from 'src/app/utils/services/status.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.page.html',
  styleUrls: ['./invoice.page.scss'],
})
export class InvoicePage implements OnInit {
  invoices: Array<Invoice> = [];
  startIndex: number = 0;
  jsonData: any;
  noFilter: boolean;
  isLoading: boolean = false;
  @ViewChild('infiniteScroll') infiniteScroll: IonInfiniteScroll;
  @ViewChild('filter') filter: IonSegment;
  constructor(
    private invoiceService: InvoiceService,
    private statusService: StatusService
  ) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.invoiceService.fetchInvoices().subscribe((invoices) => {
      this.invoices = invoices;
      this.jsonData = this.invoices.slice(0, 10);
      this.isLoading = false;

      console.log('invoices:',  invoices);
    });
    this.filter.value = 'all';
  }


  loadMoreData(event: any) {
    if (this.startIndex === 0) {
      this.startIndex += 10;
    }

    const nextInvoices = this.invoices.slice(this.startIndex, this.startIndex + 10);

    if (nextInvoices.length > 0) {
      this.jsonData.push(...nextInvoices);
      this.startIndex += 10;
    } else {
      event.target.disabled = true; // Désactiver le chargement supplémentaire s'il n'y a plus d'adresses
    }

    event.target.complete(); // Indiquer que le chargement est terminé
  }

  filterChanged(status: any) {
    this.startIndex = 0;
    const statusValue = status.detail.value;
    let filteredDeliveries: Array<Invoice>;

    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    if (statusValue === 'all') {
      filteredDeliveries = this.invoices.slice(0, this.startIndex + 10);
    } else {
      filteredDeliveries = this.invoices.filter((item) => {
        return item.status.toLowerCase().includes(statusValue.toLowerCase());
      });
      filteredDeliveries = filteredDeliveries.slice(0, 10);
    }
    this.jsonData = filteredDeliveries;
    this.noFilter = filteredDeliveries.length === 0;
  }


  onDownload(fileUrl: string) {
    console.log('fileUrl: ', fileUrl);
  }

  getStatus(statusKey: string){
    return this.statusService.getStatus(statusKey);
  }

}
