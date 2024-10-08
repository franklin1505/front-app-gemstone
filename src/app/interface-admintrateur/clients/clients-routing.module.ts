import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardClientComponent } from './dashboard-client/dashboard-client.component';
import { ViewClientComponent } from './view-client/view-client.component';
import { GestionClientsComponent } from './gestion-clients/gestion-clients.component';

const routes: Routes = [
  { path: '', component: DashboardClientComponent },
  { path: 'liste', component: ViewClientComponent },
  { path: 'gestionClient', component: GestionClientsComponent },
  { path: 'gestionClient/:id', component: GestionClientsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
