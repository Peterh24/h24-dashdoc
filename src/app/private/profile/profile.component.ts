import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { take } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CompanyService } from 'src/app/services/company.service';
import { ConfigService } from 'src/app/services/config.service';
import { API_URL, CURRENT_COMPANY } from 'src/app/services/constants';
import { NotificationsService } from 'src/app/services/notifications.service';
import { phoneValidator, regex } from 'src/app/utils/regex';

@Component({
  selector: 'app-profile-component',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent  implements OnInit {
  @Input() desktopOnly = false;
  @Input() show = false;
  @Input() isModal = false;

  success: boolean;
  showSignout = false;

  form = this.formBuilder.nonNullable.group({
    firstname: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    phone: ['', [Validators.required, phoneValidator ()]],
    email: ['', [Validators.required, Validators.pattern(regex.email)]],

  });

  constructor(
    public config: ConfigService,
    public authService: AuthService,
    public companyService: CompanyService,
    public notifications: NotificationsService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {

  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    const currentUser = this.authService.currentUser;
    this.success = undefined;

    if(!currentUser){
      this.router.navigateByUrl('/private/tabs/home');
    } else {
      this.authService.loadCurrentUserDetail(currentUser.id).pipe(take(1)).subscribe({
        next: (res:any) => {
          this.success = true;
          this.form.patchValue({
            firstname: res.firstname,
            lastname: res.lastname,
            phone: res.phone,
            email: res.email,
          })
        },
        error: (err) => {
          this.success = false;
        }
      })
    }
  }

  setShowSignout (value = true) {
    this.showSignout = value;
  }

  signout (modal: IonModal) {
    if (modal) {
      modal.dismiss ();
    }

    this.authService.signOut ();
  }

  goto (url: string) {
    this.router.navigateByUrl (url);
  }

  isActive (page: string) {
    return document.location.href.includes (page);
  }
}
