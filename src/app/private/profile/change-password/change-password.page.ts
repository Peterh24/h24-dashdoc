import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {
  form = this.formBuilder.nonNullable.group({
    password: ['', [Validators.required]],
    newpassword: ['', [Validators.required]],
    newpasswordconf: ['', [Validators.required]]
  });
  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
  }

  onSubmit() {

  }

}
