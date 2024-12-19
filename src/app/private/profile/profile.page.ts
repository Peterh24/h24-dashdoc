import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { take } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { API_URL, DASHDOC_COMPANY } from 'src/app/services/constants';
import { phoneValidator, regex } from 'src/app/utils/regex';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  company: string;
  success: boolean;
  form = this.formBuilder.nonNullable.group({
    firstname: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    phone: ['', [Validators.required, phoneValidator ()]],
    email: ['', [Validators.required, Validators.pattern(regex.email)]],

  });

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const currentUser = this.authService.currentUser;
    this.success = undefined;
    this.storage.get(DASHDOC_COMPANY).then((company: string) => {
      this.company = company;
    });

    if(!currentUser){
      this.router.navigateByUrl('/private/tabs/home');
    } else {
      this.http.get(`${API_URL}app_users/${currentUser.id}`).pipe(take(1)).subscribe((res:any) => {
        this.form.patchValue({
          firstname: res.firstname,
          lastname: res.lastname,
          phone: res.phone,
          email: res.email,
        })
      })
    }
  }

}
