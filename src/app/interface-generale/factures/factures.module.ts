import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from "primeng/dropdown";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { DashboardFactureComponent } from './dashboard-facture/dashboard-facture.component';
import { GenererFactureComponent } from './generer-facture/generer-facture.component';
import { ViewFactureComponent } from './view-facture/view-facture.component';
import { FacturesRoutingModule } from './factures-routing.module';
import { TableModule } from 'primeng/table';
import { ImageModule } from 'primeng/image';
import { DividerModule } from 'primeng/divider';
import { TieredMenuModule } from 'primeng/tieredmenu';

import { GestionFacturesComponent } from './gestion-factures/gestion-factures.component';
@NgModule({

  declarations: [
    GenererFactureComponent,
    DashboardFactureComponent,
    ViewFactureComponent,
    GestionFacturesComponent
  ],
  imports: [
    CommonModule,TableModule,ImageModule,DividerModule,TieredMenuModule,
    MenuModule, BadgeModule, RippleModule,ButtonModule, AvatarModule,PaginatorModule,FileUploadModule,
    FacturesRoutingModule,DropdownModule,FormsModule,ReactiveFormsModule,TagModule,
    BreadcrumbModule,ToolbarModule,InputTextModule,SplitButtonModule,CheckboxModule,ProgressSpinnerModule,DialogModule,
  ],
})
export class FacturesModule { }
