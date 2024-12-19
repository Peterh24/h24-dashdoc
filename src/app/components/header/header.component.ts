import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CompanyService } from 'src/app/services/company.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {
  @Input() defaultHref: string;
  @Input() slot: string = 'start';
  @Input() title: string;
  
  constructor(
    private authService: AuthService,
    public companyService: CompanyService,
    private router: Router
  ) { }



  ngOnInit(
  ) {}

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
}
