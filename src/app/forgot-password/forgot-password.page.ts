import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../utils/services/storage.service';
import { passwordValidator, regex, regexErrors } from '../utils/regex';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from '../services/constants';
import { map } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  private regex: any = regex;
  regexErrors: any = regexErrors;

  formPasswordEmail: FormGroup;
  formPasswordChange: FormGroup;
  emailRemember: string;
  token: string;
  user: string;
  success: boolean;

  constructor(
    private storageService: StorageService,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.formPasswordEmail = new FormGroup({
      email: new FormControl(this.emailRemember, {
        validators: [Validators.required, Validators.pattern(this.regex.email)]
      })
    });

    this.formPasswordChange = new FormGroup({
      password1: new FormControl(null, {
        validators: [Validators.required, passwordValidator () ]
      }),
      password2: new FormControl(null, {
        validators: [Validators.required, passwordValidator () ]
      }),
    });

    this.loadEmail();
  }

  ionViewWillEnter() {
    this.route.queryParamMap.subscribe (queryMap => {  
      this.token = queryMap.get ("token");
      this.user = queryMap.get ("user");
      this.success = false;
    });
  }

  loadEmail () {
    this.storageService.getData('EMAIL').then(elem => {
      if(elem){
        this.formPasswordEmail.get('email').patchValue(elem);
        this.formPasswordEmail.get('email').updateValueAndValidity();
      }
    });
  }

  // TODO: set end point
  requestPasswordChange (email: string) {
    return this.http.post(`${API_URL}???`, { email }).pipe(
      map((res) => {

      })
    );
  }

  // TODO: test
  updatePassword(user: string, token: string, password: string) {
    const headers = new HttpHeaders()
      .set ('Authorization', `Bearer ${token}`)
      .set ('Content-Type', 'application/merge-patch+json');

    return this.http.patch(`${API_URL}app_users/${user}`, { password }, { headers }).pipe(
      map((res) => {

      })
    );
  }

  onSubmitPasswordEmail() {
    const form = this.formPasswordChange.value;

    this.requestPasswordChange (form.email).subscribe ({
      next: () => {
        this.success = true;
      },
      error: async (error)=> {
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'La requête a echouée: '+ error.error.message,
          buttons: ['Ok']
        });

        await alert.present();  
      }
    });
  }

  async onSubmitPasswordChange () {
    const form = this.formPasswordChange.value;
    let error;

    if (!this.user || !this.token) {
      error = 'Erreur inconnue';
    } else if (!form.password1 || form.password1 != form.password2) {
      error = 'Mots de passe différents';
    }

    if (error) {
      const alert = await this.alertController.create({
        header: error,
        buttons: ['Compris'],
      });

      await alert.present();
    } else {
      this.updatePassword (this.user, this.token, form.password1).subscribe ({
        next: () => {
          this.success = true;
        },
        error: async (error)=> {
          const alert = await this.alertController.create({
            header: 'Erreur',
            message: 'La modification du mot de passe a echouée: '+ error.error.message,
            buttons: ['Ok']
          });
  
          await alert.present();  
        }
      });
    }
  }

}
