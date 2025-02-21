import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, IonInput, LoadingController, ToastController } from '@ionic/angular';
import { passwordValidator, phoneValidator, regex, regexErrors } from '../utils/regex';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HTTP_REQUEST_UNKNOWN_ERROR } from '../services/constants';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.page.html',
    styleUrls: ['./sign-up.page.scss', '../auth/auth.desktop.page.scss'],
    standalone: false
})
export class SignUpPage implements OnInit {
  private regex: any = regex;
  regexErrors: any = regexErrors;
  isClient:boolean = false;
  form = this.formBuilder.nonNullable.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    phone_number: ['', [Validators.required, phoneValidator ()]],
    email: ['', [Validators.required, Validators.pattern(this.regex.email)]],
    password: ['', [Validators.required, passwordValidator ()]],
    company: [''],
    isClient: [false, [Validators.required]]
  });


  constructor(
    private loadingController: LoadingController,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
  }

  toggleShowPassword (input: IonInput) {
    input.type = input.type === 'text' ? 'password' : 'text';
  }

  async onSubmit() {
    const { first_name, last_name, phone_number, email, password, isClient, company } = this.form.getRawValue();

    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: '<div class="h24loader"></div>',
      spinner: 'bubbles'
    });
    await loading.present();
    this.authService.register(first_name, last_name, phone_number, email, password, isClient, company).subscribe({
      next: async (res) => {
        loading.dismiss();

        this.router.navigateByUrl ('/auth');

        const toast = await this.toastController.create({
          message: 'Votre demande d\'inscription a été envoyée',
          duration: 60000,
          position: 'bottom',
          icon: 'checkbox-outline',
          cssClass: 'success'
        });

        await toast.present();
      },
      error: async (error) => {
        loading.dismiss();
        console.log('error: ', error);
        let errorMessage = HTTP_REQUEST_UNKNOWN_ERROR;

        const alert = await this.alertController.create({
          header: 'Erreur',
          message: errorMessage,
          buttons: ['Ok']
        });

        await alert.present();
      }
    });
  }

  onAlreadyClientChange(event: any){
    this.isClient = !!event.target?.value;
    this.form.get ('company').setValidators (this.isClient ? Validators.required : null);
    this.form.get ('company').updateValueAndValidity ();
    this.form.get('isClient').patchValue(this.isClient);
    this.form.get('isClient').updateValueAndValidity();
  }
}
