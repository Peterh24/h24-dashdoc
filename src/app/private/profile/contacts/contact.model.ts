export class Contact {

    constructor(
      public id: string,
      public first_name: string,
      public last_name: string,
      public email: string,
      public phone_number: string,
      public company: string,
      public company_name: string,
      public has_pending_invite: boolean = false
    ){}
  }
