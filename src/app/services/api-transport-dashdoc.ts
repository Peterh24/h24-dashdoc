import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Storage } from "@ionic/storage-angular";

export class ApiTransportDashdoc {
    static model: string = 'dashdoc';
    static isDashdoc: boolean = true;

    storage = inject (Storage);
    http = inject (HttpClient);

    constructor() { 
    }
}  