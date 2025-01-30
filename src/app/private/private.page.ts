import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { AuthService } from '../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { DASHDOC_COMPANY } from '../services/constants';
import { CompanyService } from '../services/company.service';
import { NotificationsService } from '../services/notifications.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-private',
  templateUrl: './private.page.html',
  styleUrls: ['./private.page.scss'],
})
export class PrivatePage {
  private dashdocTokensSub: Subscription;
  private userhasChooseCompanySub: Subscription;
  showBackButton: boolean = true;
  companyName: string;
  showClientMenu = false;

  constructor(
    private platform: Platform,
    public config: ConfigService,
    public authService: AuthService,
    public companyService: CompanyService,
    public notifications: NotificationsService,
    private router: Router,
    private storage: Storage,
  ) { }

  ionViewWillEnter() {
    this.showClientMenu = false;

    this.userhasChooseCompanySub = this.companyService.userHasChooseCompany.subscribe((res) => {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.showBackButton = this.isBackButtonVisible();
        }
      });
    });

    this.companyService.companyName.subscribe(companyName => {
      if(companyName != ''){
        this.companyName = companyName;
      } else {
        //TODO: uncomment this
        //this.router.navigateByUrl('/private/tabs/home');
      }

    });
  }

  isBackButtonVisible() {
    const currentUrl = this.platform.url();
    if(currentUrl.includes('/home') || currentUrl.includes('/profile/details')) {
      return false
    }
    return true
  }

  signOut() {
    this.authService.signOut();
  }

}
