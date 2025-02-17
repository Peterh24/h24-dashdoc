export class Transport {
  isMultipoint: boolean;
  draftName: string;
  trailers: any[];

  constructor(
    public uid: string,
    public type: string,
    public created: string,
    public shipper_reference: string,
    public status: string,
    public global_status: string,
    public statuses: any,
    public pricing_total_price: number,
    public quotation_total_price: number,
    public deliveries: Array<Delivery>,
    public segments: Array<Delivery>,
    public messages: Array<Message>,
    public documents: Array<Document>,
    public license_plate: string,
    public vehicle: string,
    public carbon_footprint: number
  ){}

}

export class Delivery {
  file: any; // TODO
  constructor(
    public uid: string,
    public origin: Site,
    public destination: Site,
    public planned_loads: Array<Load>,
    public tracking_contacts: Array<Contact>,
    public shipper_reference: any,
    public shipper_address: any, // TODO
  ) {}
}

export class Site {
  constructor(
    public address: Address,
    public slots: Array<any>,
    public instructions: string,
    public reference: string,
    public handlers: number,
    public guarding: boolean,
    public file: any
  ) {}
}

export class Address {
  constructor(
    public id: string,
    public name: string,
    public address: string,
    public postcode: string,
    public city: string,
    public country: string,
    public latitude: number,
    public longitude: number,
  ) {}
}

export class Load {
  constructor(
    public id: string,
    public description: string,
    public category: string,
    public complementary_information: string,
    public quantity: number,
    public volume: number,
    public volume_display_unit: string,
    public weight: number,
    public linear_meter: number
  ) {}
}

export class Contact {
  constructor (
    public id: string,
    public company: any, // TODO
    public first_name: string,
    public last_name: string,
    public email: string,
    public phone_number: string
  ) {}
}

export class Message { // TODO
  constructor(
    public created: string,
    public document: string,
  ) {}
}

export class Document {
  constructor(
    public file_updated_date: string,
    public name: string,
    public file: string,
  ) {}
}

