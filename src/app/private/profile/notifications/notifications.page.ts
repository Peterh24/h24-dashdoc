import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  constructor(
    public authService: AuthService
  ) { 
  }

  ngOnInit() {
  }

  ionViewDidLeave () {
    this.authService.resetFirebasePushNotifications ();
  }
}
