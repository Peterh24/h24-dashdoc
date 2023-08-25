import { Component, OnInit } from '@angular/core';
import { TransportService } from 'src/app/services/transport.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {

  constructor(private transportService: TransportService,) { }

  ngOnInit() {
    this.transportService.trailers.push({
      "license_plate": this.transportService.vehicle
    });
    this.transportService.deliveries.forEach(delivery => {
      let segment = {
        origin: delivery.origin,
        destination: delivery.destination,
        trailer:this.transportService.trailers
      }
      this.transportService.segments.push(segment);
    })
    console.log('DELIVERIES: ', this.transportService.deliveries);
    console.log('TRAILERS: ', this.transportService.trailers);
    console.log('SEGMENTS: ', this.transportService.segments);
  }

}
