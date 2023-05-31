import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../utils/services/storage.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  form: FormGroup;
  emailRemember: string;
  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(this.emailRemember, {
        updateOn: 'blur',
        validators: [Validators.required]
      })
    });

    this.loadEmail();
  }

  loadEmail () {
    this.storageService.getData('EMAIL').then(elem => {
      if(elem){
        this.form.get('email').patchValue(elem);
        this.form.get('email').updateValueAndValidity();
      }
    });
  }

  onSubmit() {

  }

}
