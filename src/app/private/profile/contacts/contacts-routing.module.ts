import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactsPage } from './contacts.page';

const routes: Routes = [
  {
    path: '',
    component: ContactsPage
  },
  {
    path: 'new-contact/:contactId',
    loadChildren: () => import('./new-contact/new-contact.module').then( m => m.NewContactPageModule)
  },
  {
    path: 'new-contact',
    loadChildren: () => import('./new-contact/new-contact.module').then( m => m.NewContactPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactsPageRoutingModule {}
