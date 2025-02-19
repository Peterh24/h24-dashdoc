import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { AuthService } from 'src/app/services/auth.service';
import { CompanyService } from 'src/app/services/company.service';
import { ConfigService } from 'src/app/services/config.service';
import { CURRENT_COMPANY } from 'src/app/services/constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {
  @Input() defaultHref: string;
  @Input() slot: string = 'start';
  @Input() title: string;
  showClientMenu = false;

  constructor(
    private authService: AuthService,
    public companyService: CompanyService,
    public config: ConfigService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  callTo() {
    const phoneNumber = '0180275460';
    window.open(`tel:${phoneNumber}`, '_system');
  }

  signOut(){
    this.authService.signOut();
  }

  isActive (regex: string) {
    return document.location.href.match (regex);
  }

  toggleShowClientMenu () {
    if (this.config.isDesktop) {
      this.showClientMenu = !this.showClientMenu;
    }
  }

  goto (url: string) {
    this.router.navigateByUrl (url);
  }
}
