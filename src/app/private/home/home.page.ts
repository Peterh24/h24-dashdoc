import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ModalAddTokenComponent } from './modal-add-token/modal-add-token.component';
import { Company } from '../models/company.model';
import { CompanyService } from 'src/app/services/company.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private companiesSub: Subscription;
  loadedCompanies: Array<Company>;

  constructor(
    private companyService: CompanyService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.companiesSub = this.companyService.companies.subscribe(companies => {
      this.loadedCompanies = companies;
      console.log('loading: ', this.loadedCompanies);
    })
  }

  async onAddCompany() {
    const modal = await this.modalCtrl.create({
      component: ModalAddTokenComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      const token = data;
      //Requette API pour ajouter le token
      alert('Le token ' +data+ ' a ete ajouté');
    }
  }
}
