import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL } from '../../../../app/services/constants';
import { take } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { regex, regexErrors } from 'src/app/utils/regex';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

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
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  ngOnInit() {

  }



  async onSubmit(){
    const { firstname, lastname, phone, email, password } = this.form.getRawValue();

    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: 'Edition du compte...',
      spinner: 'bubbles'
    })
    await loading.present();

    this.authService.register(firstname, lastname, phone, email, password).subscribe({
      next: (res) => {
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
