import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  isMobile = false;
  isDesktop = false;
  currentCompany: string;

  constructor(
    private platform: Platform, 
  ) { 
    this.updateDeviceType ();
    addEventListener("resize", (event) => { this.updateDeviceType () });
  }

  updateDeviceType () {
    this.platform.ready().then(() => {
      this.isMobile = this.platform.width() < 768;
      this.isDesktop = !this.isMobile;
    });
  }

  setCurrentCompany (company: any) {
    this.currentCompany = company ? String(company) : null;
  }
}
