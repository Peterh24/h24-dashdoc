import { Component, OnInit } from '@angular/core';
import { TransportService } from 'src/app/services/transport.service';

@Component({
  selector: 'app-pick-up',
  templateUrl: './pick-up.page.html',
  styleUrls: ['./pick-up.page.scss'],
})
export class PickUpPage implements OnInit {

  constructor(
    private transportService: TransportService,
  ) { }

  ngOnInit() {
    console.log('transport: ', this.transportService.transport);
  }

}
