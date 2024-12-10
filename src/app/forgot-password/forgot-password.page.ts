import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../utils/services/storage.service';
import { regex, regexErrors } from '../utils/regex';
import { AuthService } from '../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  regexErrors: any = regexErrors;

  form: FormGroup;
  emailRemember: string;
  success: boolean;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(this.emailRemember, {
        validators: [Validators.required, Validators.pattern(regex.email)]
      })
    });

    this.loadEmail();
  }

  loadEmail () {
    this.storageService.getData('EMAIL').then(elem => {
      if(elem){
        this.form.get('email').patchValue(elem);
        this.form.get('email').updateValueAndValidity();
      }
    });
  }

  onSubmit() {
    this.authService.resetPasswordRequest (this.form.value.email).subscribe ({
      next: (res) => {
        this.success = true;
      },
      error: async (error) => {
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Echec requête changement de mot de passe: ' + error.error.message,
          buttons: ['Ok']
        });  
    
        await alert.present();    
      }
    })
  }

}
