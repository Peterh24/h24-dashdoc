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
    email: ['', [Validators.required, Validators.pattern(this.regex.email)]],
    password: ['', [Validators.required]]
  });

  constructor(
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  ngOnInit() {

  }

  async onSubmit() {
    const { firstname, lastname, phone, email, password } = this.form.getRawValue();

    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: 'Création du compte...',
      spinner: 'bubbles'
    });
    await loading.present();
    this.authService.register(firstname, lastname, phone, email, password).subscribe({
      next: (res) => {
        loading.dismiss();
        this.authService.login(email, password);
      },
      error: async (error) => {
        loading.dismiss();
        console.log('error: ', error);
        let errorMessage = 'Une erreur inconnue s\'est produite';

        if (error && error.error && error.error.message) {
          errorMessage = 'Enregistrement échoué: ' + error.error.message;
        }

        const alert = await this.alertController.create({
          header: 'Erreur',
          message: errorMessage,
          buttons: ['Ok']
        });

        await alert.present();
      }
    });
  }

}
