export class Delivery {
  constructor(
    public uid: string,
    public shipper_reference: string,
    public global_status: string,
    public pricing_total_price: number,
    public deliveries: Array<Deliveries>,
    public license_plate: string,
    public created: string,
  ){}
}

export interface Deliveries {
  uid: string;
  origin: Origin;
  destination: Destination;
}

export interface Origin {

  address: Address,
  instructions: string
}

export interface Destination {
  address: Address,
  instructions: string,
}

export interface Address {
  name: string,
  address: string,
  postcode: string,
  city: string,
  country: string
}
