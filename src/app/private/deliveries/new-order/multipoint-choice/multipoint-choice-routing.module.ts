import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultipointChoicePage } from './multipoint-choice.page';

const routes: Routes = [
  {
    path: '',
    component: MultipointChoicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultipointChoicePageRoutingModule {}
