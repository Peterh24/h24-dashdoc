import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-private',
  templateUrl: './private.page.html',
  styleUrls: ['./private.page.scss'],
})
export class PrivatePage implements OnInit {
  showBackButton: boolean = true;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showBackButton = this.isBackButtonVisible();
      }
    });


    // Vérifier si le bouton de retour doit être désactivé
    // if (disableBackButton) {
    //   this.showBackButton = false;
    // } else {
    //   this.showBackButton = true;
    // }
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
