import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CompanyService } from '../services/company.service';
import { NotificationsService } from '../services/notifications.service';
import { ConfigService } from '../services/config.service';

@Component({
    selector: 'app-private',
    templateUrl: './private.page.html',
    styleUrls: ['./private.page.scss'],
    standalone: false
})
export class PrivatePage {
  companyName: string;

  constructor(
    public config: ConfigService,
    public authService: AuthService,
    public companyService: CompanyService,
    public notifications: NotificationsService,
  ) { }

  ionViewWillEnter() {
  }
}
