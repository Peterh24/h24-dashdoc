export class User {
    constructor(
        public id: number,
        public email: string,
        public first_name: string,
        public last_name: string,
        public phone_number: string,
        public company: number,
        public tokens?: any[]
    ) {}
}