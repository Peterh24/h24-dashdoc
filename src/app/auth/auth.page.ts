import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StorageService } from '../utils/services/storage.service';
import { regex, regexErrors } from '../utils/regex';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage {
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
    private navCtrl: NavController,
    private alertController: AlertController,
    private storage: Storage
  ) { }

  async ionViewWillEnter() {
    const token = await this.storage.get('JWT_KEY');
    
    // if(this.authService.userIsAuthenticated || token){
    //   this.router.navigateByUrl('/private/tabs/home');
    // }
    
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
      message: '<div class="h24loader"></div>',
      spinner: null,
    })
    await loading.present();


    this.authService.login(email, password).subscribe({
      next: (res) => {
        loading.dismiss();
        this.navCtrl.navigateRoot('/private/tabs/home', { animated: true, animationDirection: 'forward' });
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
        loading.dismiss();
        this.router.navigateByUrl('/private/tabs/home');
      }
    });


  }

}
