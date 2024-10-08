import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { ReservationsRoutingModule } from './reservations-routing.module';
import { ViewReservationComponent } from './view-reservation/view-reservation.component';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from "primeng/dropdown";
import { DashboardResevationsComponent } from './dashboardResevations/dashboardResevations.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { UpdateReservationComponent } from './update-reservation/update-reservation.component';
import { DetailReservationComponent } from './detail-reservation/detail-reservation.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { ModuleResaAdminComponent } from './module-resa-admin/module-resa-admin.component';
import { ModuleResaClientAcComponent } from './module-resa-client-ac/module-resa-client-ac.component';
import { ModuleResaClientScComponent } from './module-resa-client-sc/module-resa-client-sc.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { CalendarModule } from 'primeng/calendar';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabelModule } from "primeng/floatlabel"
import { InplaceModule } from 'primeng/inplace';
import { InputOtpModule } from 'primeng/inputotp';
import { StepperModule } from 'primeng/stepper';
import { DataViewModule } from 'primeng/dataview';
import { RatingModule } from 'primeng/rating';
import { FieldsetModule } from 'primeng/fieldset';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';


@NgModule({
  declarations: [
    ViewReservationComponent,
    DashboardResevationsComponent,
    UpdateReservationComponent,
    DetailReservationComponent,
    ModuleResaAdminComponent,
    ModuleResaClientAcComponent,
    ModuleResaClientScComponent

  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  imports: [
    CommonModule,CalendarModule,InputGroupModule, InputGroupAddonModule,FloatLabelModule,InplaceModule,InputOtpModule,PanelModule,
    MenuModule, BadgeModule, RippleModule,ButtonModule, AvatarModule,PaginatorModule,FileUploadModule,StepperModule,RatingModule,
    ReservationsRoutingModule,DropdownModule,FormsModule,ReactiveFormsModule,TagModule,ConfirmPopupModule,DataViewModule,FieldsetModule,
    BreadcrumbModule,ToolbarModule,InputTextModule,SplitButtonModule,CheckboxModule,ProgressSpinnerModule,DialogModule,CardModule,PasswordModule,
  ]
})
export class ReservationsModule { }
