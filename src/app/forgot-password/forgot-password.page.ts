import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../utils/services/storage.service';
import { regex, regexErrors } from '../utils/regex';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  private regex: any = regex;
  regexErrors: any = regexErrors;

  form: FormGroup;
  emailRemember: string;
  constructor(
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(this.emailRemember, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.pattern(this.regex.email)]
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
