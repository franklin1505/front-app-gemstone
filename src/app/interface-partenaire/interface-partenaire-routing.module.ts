import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChauffeursComponent } from './chauffeurs/chauffeurs.component';
import { ProfilComponent } from './profil/profil.component';
import { VehiculesComponent } from './vehicules/vehicules.component';

const routes: Routes = [
  { path: 'profil', component: ProfilComponent },
  { path: 'mes-chauffeurs', component: ChauffeursComponent },
  { path: 'mes-vehicules', component: VehiculesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InterfacePartenaireRoutingModule { }
