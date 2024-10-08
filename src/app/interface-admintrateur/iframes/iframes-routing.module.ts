import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IframeDashboardComponent } from './iframe-dashboard/iframe-dashboard.component';

const routes: Routes = [
  { path: '', component: IframeDashboardComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IframesRoutingModule { }
