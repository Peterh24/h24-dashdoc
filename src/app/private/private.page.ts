import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { AuthService } from '../services/auth.service';
import { DashdocService } from '../services/dashdoc.service';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, firstValueFrom, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL, USER_STORAGE_KEY } from '../services/constants';

@Component({
  selector: 'app-private',
  templateUrl: './private.page.html',
  styleUrls: ['./private.page.scss'],
})
export class PrivatePage implements OnInit {
  private dashdocTokensSub: Subscription;

  showBackButton: boolean = true;
  constructor(
    private platform: Platform,
    private storage: Storage,
    private authService: AuthService,
    private dashdocService: DashdocService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showBackButton = this.isBackButtonVisible();
      }
    });

    this.dashdocTokensSub = this.dashdocService.tokens.subscribe(async tokens => {
      for (const token of tokens) {
        const dashdocToken = token.token
        console.log('dashdocToken: ', dashdocToken);
        this.storage.set(USER_STORAGE_KEY, dashdocToken);
        try {
          const response = await firstValueFrom(this.http.get(`${DASHDOC_API_URL}companies`));
          console.log('API response:', response);
        } catch (error) {
          console.error('Erreur lors de l\'appel API:', error);
        }
      }
    })


    // Vérifier si le bouton de retour doit être désactivé
    // if (disableBackButton) {
    //   this.showBackButton = false;
    // } else {
    //   this.showBackButton = true;
    // }
  }

  ionViewWillEnter(){

  }

  isBackButtonVisible() {
    const currentUrl = this.platform.url();
    if(currentUrl.includes('/home') || currentUrl.includes('/transports') || currentUrl.includes('/profile/details')) {
      return false
    }
    return true
  }

  signOut() {


    this.authService.signOut();
  }

}
