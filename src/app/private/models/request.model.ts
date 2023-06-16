export class Request {
  constructor(
    public count?: number,
    public next?: string,
    public previous?: string,
    public results?: Array<any>
  ){}
}
