import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../utils/services/storage.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  form: FormGroup;
  emailRemember: string;
  isRemember: boolean = false;
  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.loadEmail();
    this.form = new FormGroup({
      email: new FormControl(this.emailRemember, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      password: new FormControl(null, {
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
        this.isRemember = true;
      }

    });
  }

  onRememberChange(){
    this.isRemember = !this.isRemember;
  }

  onLogin(){
    if(this.isRemember){
      this.storageService.addData('EMAIL', this.form.get('email').value);
    } else {
      this.storageService.removeData('EMAIL');
    }

  }

}
