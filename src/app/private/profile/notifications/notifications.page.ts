import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationsService } from 'src/app/services/notifications.service';

// TODO!
@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
    standalone: false
})
export class NotificationsPage implements OnInit {

  constructor(
    public notifications: NotificationsService
  ) { 
  }

  ngOnInit() {
  }

  ionViewDidLeave () {
    this.notifications.reset ();
  }
}
