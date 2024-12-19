import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { passwordValidator } from 'src/app/utils/regex';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {
  form: FormGroup;
  success: boolean;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      password: new FormControl(null, {
        validators: [Validators.required ]
      }),
      password1: new FormControl(null, {
        validators: [Validators.required, passwordValidator () ]
      }),
      password2: new FormControl(null, {
        validators: [Validators.required, passwordValidator () ]
      }),
    });
  }

  ionViewWillEnter() {
    this.success = undefined;
  }

  async onSubmit() {
    const value = this.form.value;

    let error;

    if (!value.password1 || value.password1 != value.password2) {
      error = 'Mots de passe différents';
    }

    if (error) {
      const alert = await this.alertController.create({
        header: error,
        buttons: ['Compris'],
      });

      await alert.present();
    } else {
      this.authService.changePassword (value.password, value.password1).subscribe ({
        next: (res) => {
          this.success = true;
        },
        error: async (error) => {
          const alert = await this.alertController.create({
            header: "Echec de la requête: " + error.error.message,
            buttons: ['Compris'],
          });
    
          await alert.present();    
        }
      });
    }
  }

}
