import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewReservationComponent } from './view-reservation/view-reservation.component';
import { DashboardResevationsComponent } from './dashboardResevations/dashboardResevations.component';
import { DetailReservationComponent } from './detail-reservation/detail-reservation.component';
import { UpdateReservationComponent } from './update-reservation/update-reservation.component';
import { ModuleResaClientAcComponent } from './module-resa-client-ac/module-resa-client-ac.component';
import { ModuleResaAdminComponent } from './module-resa-admin/module-resa-admin.component';
import { ModuleResaClientScComponent } from './module-resa-client-sc/module-resa-client-sc.component';

const routes: Routes = [
  { path: '', component: DashboardResevationsComponent },
  { path: 'liste', component: ViewReservationComponent },
  { path: 'detail/:id', component: DetailReservationComponent },
  { path: 'update/:id', component: UpdateReservationComponent },
  { path: 'reserver', component: ModuleResaAdminComponent },
  { path: 'reserverAc', component: ModuleResaClientAcComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationsRoutingModule { }
