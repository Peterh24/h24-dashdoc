import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonSelect, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Subscription, take } from 'rxjs';
import { ModalAddTokenComponent } from './modal-add-token/modal-add-token.component';
import { Company } from '../models/company.model';
import { CompanyService } from 'src/app/services/company.service';
import { USER_STORAGE_KEY } from 'src/app/services/constants';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  private companiesSub: Subscription;
  private currentCompany: Subscription;
  loadedCompanies: Array<Company>;
  isCompanySelected: boolean = false;
  @ViewChild('companyChoose', { static: false }) companyChoose: IonSelect;
  constructor(
    private storage: Storage,
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

  onchooseCompany(event: any){
    const currentCompany = event.detail.value;
    this.currentCompany = this.companyService.getCompany(currentCompany).subscribe(company => {
      this.companyService.setCompanyName(company.name);
      this.storage.set(USER_STORAGE_KEY, company.token);
    });
  }

  openSelect(){
    this.companyChoose.open();
  }

  ngOnDestroy() {
    if(this.companiesSub) {
      this.companiesSub.unsubscribe();
    }
    if(this.currentCompany) {
      this.currentCompany.unsubscribe();
    }
  }
}
