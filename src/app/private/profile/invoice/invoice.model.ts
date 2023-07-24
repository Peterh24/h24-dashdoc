export class Invoice {
    constructor(
      public id: string,
      public invoice_number: string,
      public amount: string,
      public currency: string,
      public status: string,
      public file_url: string,
      public filename: string,
      public date: string,
      public customer: Customer,
      public line_items: Array<Item>
    ){}

  }

export interface Customer {
    address: string;
    postal_code: string;
    city: string;
    country_alpha2: string;
}

export interface Item {
    label: string;
    amount: string;
}