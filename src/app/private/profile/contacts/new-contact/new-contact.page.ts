import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ContactsService } from 'src/app/services/contacts.service';
import { phoneValidator, regex } from 'src/app/utils/regex';
import { HTTP_REQUEST_UNKNOWN_ERROR } from 'src/app/services/constants';
import { ApiTransportService } from 'src/app/services/api-transport.service';
import { Company } from 'src/app/private/models/company.model';
import { Contact } from 'src/app/private/models/transport.model';
import { CompanyService } from 'src/app/services/company.service';

@Component({
    selector: 'app-new-contact',
    templateUrl: './new-contact.page.html',
    styleUrls: ['./new-contact.page.scss'],
    standalone: false
})
export class NewContactPage implements OnInit {

  @Input() contactId: string;
  @Input() isModal: boolean;
  form: FormGroup;
  contact: Contact;
  companies: Company[];
  constructor(
    private apiTransport: ApiTransportService,
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private contactsService: ContactsService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private alertController: AlertController,
    private router: Router,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      first_name: new FormControl(null, { validators: [Validators.required] }),
      last_name: new FormControl(null, { validators: [Validators.required] }),
      email: new FormControl(null, { validators: [Validators.required, Validators.pattern(regex.email)] }),
      phone_number: new FormControl(null, { validators: [Validators.required, phoneValidator ()] }),
      company: new FormControl(null, { validators: [Validators.required] }),
    });

    this.route.paramMap.subscribe(
      paramMap => {
        this.contactsService.fetchContactsCompanies().subscribe({
          next: (companies: Company[]) => {
            this.companies = companies;

            const contactId = paramMap.get ('contactId') || this.contactId;
            if (contactId) {
              const contact = this.contactsService.getContact (contactId);
              this.contact = contact,
              this.form.patchValue (contact);
              this.form.updateValueAndValidity ();
            } else {
              if (companies?.length) {
                const company = companies.find ((c) => c.id == this.companyService.currentCompany?.id);
                this.form.controls['company'].setValue (company?.id || companies[0].id);
              }
            }
          }});
     });
  }

  async onSubmit(){
    if(!this.form.valid) {
      return;
    }
    this.loadingController.create({
      message: '<div class="h24loader"></div>',
    }).then(loadingElement => {
      loadingElement.present();

      let request, company: Company;
      company = this.companies.find ((c) => c.id == this.form.value.company);

      if (this.contact?.id) {
        request = this.contactsService.updateContact(this.contact.id, this.form.value.first_name, this.form.value.last_name, this.form.value.email, this.form.value.phone_number, company.id, company.name);
      } else {
        request = this.contactsService.addContact(this.form.value.first_name, this.form.value.last_name, this.form.value.email, this.form.value.phone_number, company.id, company.name);
      }

      request.subscribe({
        next: (res) => {
          loadingElement.dismiss();

          if (!this.contact?.id) {
            this.apiTransport.inviteUser (res).subscribe ();
          }

          if(!this.isModal) {
            this.router.navigate(['/private/tabs/profile/contacts']);
            return;
          } else {
            this.modalController.dismiss(res);
          }
        },
        error: async (error) => {
          console.log (error);
          loadingElement.dismiss();

          const alert = await this.alertController.create({
            header: "Erreur",
            message: HTTP_REQUEST_UNKNOWN_ERROR,
            buttons: ['Compris'],
          });

          await alert.present();
        }
      });
    });
  }

  cancel() {
    if (this.isModal) {
      this.modalController.dismiss();
    }
  }
}
