import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilComponent } from './profil/profil.component';
import { ConfigurationsComponent } from './configurations/configurations.component';
import { ClientsLiesComponent } from './clients-lies/clients-lies.component';
import { MiseAJourComponent } from './mise-a-jour/mise-a-jour.component';

const routes: Routes = [
  { path: 'profil', component: ProfilComponent },
  { path: 'config', component: ConfigurationsComponent },
  { path: 'lies', component: ClientsLiesComponent },
  { path: 'update/:id', component: MiseAJourComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InterfaceClientRoutingModule { }
