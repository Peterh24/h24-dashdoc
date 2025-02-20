import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL, HTTP_REQUEST_UNKNOWN_ERROR } from '../../../../app/services/constants';
import { take } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { phoneValidator, regex, regexErrors } from 'src/app/utils/regex';
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
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    phone_number: ['', [Validators.required, phoneValidator ()]],
    email: ['', [Validators.required, Validators.pattern(this.regex.email)]],

  });
  section: string;
  title: string;
  success: boolean;

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
    this.section = undefined;
    this.success = undefined;

    if(!currentUser){
      this.router.navigateByUrl('/private/tabs/home', { replaceUrl: true });
    } else {
      this.authService.loadCurrentUserDetail(currentUser.id).pipe(take(1)).subscribe((res:any) => {
        this.form.patchValue({
          first_name: res.first_name,
          last_name: res.last_name,
          phone_number: res.phone_number,
          email: res.email,
        })
      })
    }
  }

  showSection (section: string) {
    this.section = section;

    switch (this.section) {
      case 'user-infos':
        this.title = 'Informations personnelles';
        break;
      case 'notifications':
        this.title = 'Notifications';
        break;
      default:
        this.title = null;
    }
  }

  async onSubmit(){
    const { first_name, last_name, phone_number, email } = this.form.getRawValue();

    const loading = await this.loadingController.create({
      keyboardClose: true,
      message: '<div class="h24loader"></div>',
      spinner: 'bubbles'
    })
    await loading.present();

    this.authService.update(first_name, last_name, phone_number, email).subscribe({
      next: (res) => {
        loading.dismiss();
        this.success = true;
      },
      error: async (error) => {
        console.log('error: ', error);
        loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: HTTP_REQUEST_UNKNOWN_ERROR,
          buttons: ['Ok']
        });

        await alert.present();
      }
    })
  }

}
