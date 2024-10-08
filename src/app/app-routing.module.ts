import { InterfacePartenaireModule } from './interface-partenaire/interface-partenaire.module';
import { Chauffeur } from './utilitaires/models/gve';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './interface-generale/login/login.component';
import { AcceptationReservationComponent } from './interface-generale/module-gestion-courses/AcceptationReservation/AcceptationReservation.component';
import { FeedbackComponent } from './interface-generale/module-gestion-courses/feedback/feedback.component';
import { MiseAJourResumeComponent } from './interface-generale/module-gestion-courses/miseAJourResume/miseAJourResume.component';
import { TraitementCourseComponent } from './interface-generale/module-gestion-courses/traitement-course/traitement-course.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { AuthGuard } from './utilitaires/services/auth.guard';
import { ModuleResaClientScComponent } from './interface-generale/reservations/module-resa-client-sc/module-resa-client-sc.component';

const routes: Routes = [
  //{ path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirige vers login par défaut
  { path: '', component: LoginComponent },
  { path: 'confirmerAffectation/:identifiant/:data', component: AcceptationReservationComponent },
  { path: 'miseAJour/:data', component: MiseAJourResumeComponent },
  { path: 'traitementCourse/:identifiant', component: TraitementCourseComponent },
  { path: 'feedback/:id/:data', component: FeedbackComponent },
  { path: 'moduleDeReservation', component: ModuleResaClientScComponent },

  {
    path: 'app', component: AppLayoutComponent, canActivate: [AuthGuard],
    children: [
      { path: 'reservations', loadChildren: () => import('./interface-generale/reservations/reservations.module').then(m => m.ReservationsModule) },
      { path: 'factures', loadChildren: () => import('./interface-generale/factures/factures.module').then(m => m.FacturesModule) },
      { path: 'parametres', loadChildren: () => import('./interface-admintrateur/parametres/parametres.module').then(m => m.ParametresModule) },
      { path: 'clients', loadChildren: () => import('./interface-admintrateur/clients/clients.module').then(m => m.ClientsModule) },
      { path: 'iframes', loadChildren: () => import('./interface-admintrateur/iframes/iframes.module').then(m => m.IframesModule) },
      { path: 'chauffeur', loadChildren: () => import('./interface-chauffeur/interface-chauffeur.module').then(m => m.InterfaceChauffeurModule) },
      { path: 'client', loadChildren: () => import('./interface-client/interface-client.module').then(m => m.InterfaceClientModule) },
      { path: 'partenaire', loadChildren: () => import('./interface-partenaire/interface-partenaire.module').then(m => m.InterfacePartenaireModule) },
    ]
  },
 ]

@NgModule({
  imports: [RouterModule.forRoot(routes , { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
