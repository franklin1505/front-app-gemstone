import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardFactureComponent } from './dashboard-facture/dashboard-facture.component';
import { ViewFactureComponent } from './view-facture/view-facture.component';
import { GenererFactureComponent } from './generer-facture/generer-facture.component';
import { GestionFacturesComponent } from './gestion-factures/gestion-factures.component';

const routes: Routes = [
  { path: '', component: DashboardFactureComponent },
  { path: 'liste', component: ViewFactureComponent },
  { path: 'generer-facture', component: GenererFactureComponent },
  { path: 'gestion-facture/:id', component: GestionFacturesComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturesRoutingModule { }
