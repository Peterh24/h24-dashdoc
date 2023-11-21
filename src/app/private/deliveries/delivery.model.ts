export class Delivery {
  constructor(
    public uid: string,
    public shipper_reference: string,
    public global_status: string,
    public pricing_total_price: number,
    public quotation_total_price: number,
    public deliveries: Array<Deliveries>,
    public messages: Array<Message>,
    public documents: Array<Document>,
    public licensePlate: string,
    public requested_vehicle: string,
  ){}
}

export interface Deliveries {
  uid: string;
  origin: Information;
  destination: Information;
  loads: Array<Load>
}

export interface Message {
  created: string;
  document: string;
}

export interface Document {
  file_updated_date: string;
  name: string;
  file: string;
}

export interface Information {
  real_start: string,
  real_end: string,
  slots: Array<any>,
  address: Address,
  instructions: string
}

export interface Address {
  name: string,
  address: string,
  postcode: string,
  city: string,
  country: string
  latitude: number;
  longitude: number;
}

export interface Load {
  description: string,
  volume: number,
  volume_display_unit: string,
  weight: number
}

export interface Merchandise {
  id: string,
  name: string,
  quantity: number;
}
