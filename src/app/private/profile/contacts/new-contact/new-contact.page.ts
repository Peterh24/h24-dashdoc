import { Component, Input, OnInit } from '@angular/core';
import { Contact } from '../contact.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { ContactsService } from 'src/app/services/contacts.service';
import { phoneValidator, regex } from 'src/app/utils/regex';

@Component({
  selector: 'app-new-contact',
  templateUrl: './new-contact.page.html',
  styleUrls: ['./new-contact.page.scss'],
})
export class NewContactPage implements OnInit {

  @Input()isModal: boolean;
  form: FormGroup;
  contact: Contact;
  companies: any[];
  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private contactsService: ContactsService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private router: Router,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(
      paramMap => {
        const contactId = paramMap.get ('contactId');
        if (contactId) {
          this.contactsService.fetchContact (contactId).subscribe ({
            next: (contact) => {
              console.log (8, contact);
              this.contact = contact,
              this.form.patchValue (contact);
              this.form.updateValueAndValidity ();
            }
          })
        }

        this.contactsService.fetchContactsCompanies().subscribe({
          next: (companies) => {
            this.companies = companies;
          }});
    
        this.form = new FormGroup({
          first_name: new FormControl(null, {
            validators: [Validators.required]
          }),
          last_name: new FormControl(null, {
            validators: [Validators.required]
          }),
          email: new FormControl(null, {
            validators: [Validators.required, Validators.pattern(regex.email)
            ]
          }),
          phone_number: new FormControl(null, {
            validators: [Validators.required, phoneValidator ()]
          }),
          company: new FormControl(null, {
            validators: [Validators.required]
          }),
        });
      });
  }

  async onCreateOffer(){
    if(!this.form.valid) {
      return;
    }
    this.loadingController.create({
      message: '<div class="h24loader"></div>',
    }).then(loadingElement => {
      loadingElement.present();

      let request, company: any;
      company = this.companies.find ((c) => c.pk == this.form.value.company);
      console.log (this.form.value, company, this.companies);

      if (this.contact?.uid) {
        request = this.contactsService.updateContact(this.contact.uid, this.form.value.first_name, this.form.value.last_name, this.form.value.email, this.form.value.phone_number, company.pk, company.name);
      } else {
        request = this.contactsService.addContact(this.form.value.first_name, this.form.value.last_name, this.form.value.email, this.form.value.phone_number, company.pk, company.name);
      }

      request.subscribe(() => {
        loadingElement.dismiss();
        if(!this.isModal) {
          this.router.navigate(['/private/tabs/profile/contacts']);
          return;
        } else {
          this.modalController.dismiss();
        }
      });
    });
  }

  cancel() {
    this.modalController.dismiss();
  }
}
