export class Delivery {
  constructor(
    public uid: string,
    public shipper_reference: string,
    public global_status: string,
    public pricing_total_price: number,
    public deliveries: Array<Deliveries>,
    public license_plate: string,
  ){}
}

export interface Deliveries {
  uid: string;
  origin: Information;
  destination: Information;
  loads: Array<Load>
}

export interface Information {
  real_start: string,
  real_end: string,
  address: Address,
  instructions: string
}

export interface Address {
  name: string,
  address: string,
  postcode: string,
  city: string,
  country: string
}

export interface Load {
  description: string,
  volume: number,
  volume_display_unit: string,
  weight: number
}
