import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilComponent } from './profil/profil.component';
import { LeMarchéComponent } from './le-marché/le-marché.component';
import { MiseAJourComponent } from './mise-a-jour/mise-a-jour.component';

const routes: Routes = [
  { path: 'profil', component: ProfilComponent },
  { path: 'le-marché', component: LeMarchéComponent },
  { path: 'update/:id', component: MiseAJourComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InterfaceChauffeurRoutingModule { }
