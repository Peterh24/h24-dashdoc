import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../../app/services/constants';
import { take } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { regex, regexErrors } from 'src/app/utils/regex';
import { Router } from '@angular/router';
@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage {

  private regex: any = regex;
  regexErrors: any = regexErrors;
  form = this.formBuilder.nonNullable.group({
    firstname: ['', [Validators.required]],
    lastname: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(this.regex.phone)]],
    email: ['', [Validators.required, Validators.pattern(this.regex.email)]],

  });

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) { }

  ionViewWillEnter() {
    const currentUser = this.authService.currentUser;
    console.log('currentUser: ', currentUser);

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



  async onSubmit(){
    const { firstname, lastname, phone, email } = this.form.getRawValue();

    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: 'Edition du compte...',
      spinner: 'bubbles'
    })
    await loading.present();

    this.authService.update(firstname, lastname, phone, email).subscribe({
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
