import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { AuthService } from '../services/auth.service';
import { DashdocService } from '../services/dashdoc.service';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL, DASHDOC_COMPANY, USER_STORAGE_KEY } from '../services/constants';
import { CompanyService } from '../services/company.service';
import { NotificationsService } from '../services/notifications.service';

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
  userHasChooseCompany: boolean;
  constructor(
    private platform: Platform,
    public authService: AuthService,
    public companyService: CompanyService,
    public notifications: NotificationsService,
    private router: Router,
    private storage: Storage,
  ) { }

  ionViewWillEnter() {
    this.userhasChooseCompanySub = this.companyService.userHasChooseCompany.subscribe((res) => {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.showBackButton = this.isBackButtonVisible();
        }
      });
    });

    this.companyService.companyName.subscribe(companyName => {
      if(companyName != ''){
        this.userHasChooseCompany = true;
        this.companyName = companyName;
      } else {
        //TODO: uncomment this
        //this.router.navigateByUrl('/private/tabs/home');
      }

    });

    this.storage.get(DASHDOC_COMPANY).then((company) => {
      if(company){
        this.userHasChooseCompany = true;
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
