import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { AuthService } from 'src/app/services/auth.service';
import { CompanyService } from 'src/app/services/company.service';
import { ConfigService } from 'src/app/services/config.service';
import { DASHDOC_COMPANY } from 'src/app/services/constants';

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
  userHasChooseCompany = false;

  constructor(
    private authService: AuthService,
    public companyService: CompanyService,
    public config: ConfigService,
    private router: Router,
    private storage: Storage
  ) { }

  ngOnInit(
  ) {}

  ionViewWillEnter () {
    this.storage.get(DASHDOC_COMPANY).then((company) => {
      if(company){
        this.userHasChooseCompany = true;
      }
    });
  }

  getcompanyName() {
    if(!this.companyService.companyName) {
      this.router.navigateByUrl('/');
      return null;
    }
    return this.companyService.companyName;
  }

  callTo() {
    const phoneNumber = '0180275460';
    window.open(`tel:${phoneNumber}`, '_system');
  }

  signOut(){
    this.authService.signOut();
  }

  isActive (page: string) {
    return document.location.href.includes (page);
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
