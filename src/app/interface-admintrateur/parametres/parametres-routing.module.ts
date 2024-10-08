import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParametresDashboardComponent } from './parametres-dashboard/parametres-dashboard.component';
import { AddVehiculeComponent } from './data-parametres/add-vehicule/add-vehicule.component';
import { ViewVehiculeComponent } from './data-parametres/view-vehicule/view-vehicule.component';
import { ViewChauffeurComponent } from './data-parametres/view-chauffeur/view-chauffeur.component';
import { AddChauffeurComponent } from './data-parametres/add-chauffeur/add-chauffeur.component';
import { UpdateVehiculeComponent } from './data-parametres/update-vehicule/update-vehicule.component';
import { UpdateChauffeurComponent } from './data-parametres/update-chauffeur/update-chauffeur.component';
import { TarificationComponent } from './data-parametres/tarification/tarification.component';
import { MonEntrepriseComponent } from './data-parametres/mon-entreprise/mon-entreprise.component';
import { EntreprisePartenaireComponent } from './data-parametres/entreprise-partenaire/entreprise-partenaire.component';
import { GererEntreprisePartenaireComponent } from './data-parametres/gerer-entreprise-partenaire/gerer-entreprise-partenaire.component';
import { ChauffeursExternesComponent } from './data-parametres/chauffeurs-externes/chauffeurs-externes.component';

const routes: Routes = [
  { path: '', component: ParametresDashboardComponent },
  { path: 'vehicule', component: AddVehiculeComponent },
  { path: 'updateVehicule/:id', component: UpdateVehiculeComponent },
  { path: 'updateChauffeur/:id', component: UpdateChauffeurComponent },
  { path: 'chauffeur', component: AddChauffeurComponent },
  { path: 'vehicules/:id/:typeEntreprise', component: ViewVehiculeComponent },
  { path: 'chauffeurs/:id/:typeEntreprise', component: ViewChauffeurComponent },
  { path: 'tarification/:id', component: TarificationComponent },
  { path: 'tarification', component: TarificationComponent },
  { path: 'monEntreprise/:id', component: MonEntrepriseComponent },
  { path: 'monEntreprise', component: MonEntrepriseComponent },
  { path: 'partenaire', component: EntreprisePartenaireComponent },
  { path: 'entreprisePartenaire/:id', component: GererEntreprisePartenaireComponent },
  { path: 'entreprisePartenaire', component: GererEntreprisePartenaireComponent },
  { path: 'chauffeursExternes', component: ChauffeursExternesComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametresRoutingModule { }
