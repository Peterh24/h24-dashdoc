import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { regex, regexErrors } from '../utils/regex';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  private regex: any = regex;
  regexErrors: any = regexErrors;
  form = this.formBuilder.nonNullable.group({
    firstname: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(this.regex.phone)]],
    email: ['', [Validators.required, Validators.pattern(this.regex.email)]]
  });

  constructor(
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  ngOnInit() {

  }

  async onSubmit(){
    const { firstname, lastname, phone, email } = this.form.getRawValue();

    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: 'Creation du compte...',
      spinner: 'bubbles'
    })
    await loading.present();

    this.authService.register(firstname, lastname, phone, email).subscribe({
      next: (res) => {
        console.log('After Register: ', res);
        loading.dismiss();
      },
      error: async (error) => {
        console.log('error: ', error);
        loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Registration Failed: '+ error.error.message,
          buttons: ['Ok']
        });

        await alert.present();
      }
    })
  }

}
