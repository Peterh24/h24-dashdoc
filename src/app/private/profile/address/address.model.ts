export class Address {

  constructor(
    public pk: number,
    public name: string,
    public address: string,
    public city: string,
    public postcode: string,
    public country: string,
    public instructions: string,
    public latitude?: any,
    public longitude?: any,
  ){}
}
