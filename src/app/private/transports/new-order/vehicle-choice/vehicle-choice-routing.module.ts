import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VehicleChoicePage } from './vehicle-choice.page';

const routes: Routes = [
  {
    path: '',
    component: VehicleChoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehicleChoicePageRoutingModule {}
