import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StorageService } from '../utils/services/storage.service';
import { regex, regexErrors } from '../utils/regex';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  private regex: any = regex;
  regexErrors: any = regexErrors;

  form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(this.regex.email)]],
    password: ['', [Validators.required]]
  });
  emailRemember: string;
  isRemember: boolean = false;
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
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

  async onSubmit() {
    const { email, password } = this.form.getRawValue();

    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: '<img src ="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt=""><br /> Connection...',
      spinner: null,
    })
    await loading.present();


    // FAKE API SIMULATION JUST FOR TESTING NOT USE THIS IN PRODUCTION
    this.authService.login(email, password).subscribe({
      next: (res) => {
        loading.dismiss();
        this.router.navigateByUrl('/private/tabs/home');
      },
      error: async (error) => {
        console.log('error: ', error);
        loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Login Failed: ' + error.error.message,
          buttons: ['Ok']
        });

        await alert.present();
      },
      complete: () => {
        // Cette partie est ajoutée pour traiter la réussite de la simulation
        loading.dismiss();
        this.router.navigateByUrl('/private/tabs/home');
      }
    });


  }

}
