import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSelect, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ModalAddTokenComponent } from './modal-add-token/modal-add-token.component';
import { Company } from '../models/company.model';
import { CompanyService } from 'src/app/services/company.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private companiesSub: Subscription;
  loadedCompanies: Array<Company>;
  isCompanySelected: boolean = false;
  @ViewChild('companyChoose', { static: false }) companyChoose: IonSelect;
  constructor(
    private authService: AuthService,
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

  onchooseCompany(event: Event){
    //TODO ADD this in the request
    this.authService.switchChooseCompanyState(true).subscribe((res) => {
      this.isCompanySelected = true;
    })
  }

  openSelect(){
    this.companyChoose.open();
  }
}
