export class Vehicle {
  constructor(
    public license_plate: string,
    public model: string,
    public type: string,
    public length: number,
    public depth: number,
    public height_car: number,
    public height_chest: number,
    public payload: number,
    public price: number,
    public hayon: boolean
  ){}
}
