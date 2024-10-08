import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterfaceClientRoutingModule } from './interface-client-routing.module';
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
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenubarModule } from 'primeng/menubar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AccordionModule } from 'primeng/accordion';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabViewModule } from 'primeng/tabview';
import { EditorModule } from 'primeng/editor';
import { ProfilComponent } from './profil/profil.component';
import { ConfigurationsComponent } from './configurations/configurations.component';
import { ClientsLiesComponent } from './clients-lies/clients-lies.component';
import { MiseAJourComponent } from './mise-a-jour/mise-a-jour.component';


@NgModule({
  declarations: [
    ProfilComponent,
    ConfigurationsComponent,
    ClientsLiesComponent,
    MiseAJourComponent
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  imports: [
    CommonModule,CalendarModule,InputGroupModule, InputGroupAddonModule,FloatLabelModule,InplaceModule,InputOtpModule,PanelModule,MenubarModule,ToggleButtonModule,
    MenuModule, BadgeModule, RippleModule,ButtonModule, AvatarModule,PaginatorModule,FileUploadModule,StepperModule,RatingModule,TabMenuModule,OverlayPanelModule,EditorModule,
    InterfaceClientRoutingModule,DropdownModule,FormsModule,ReactiveFormsModule,TagModule,ConfirmPopupModule,DataViewModule,FieldsetModule,TabViewModule,AccordionModule,MultiSelectModule,
    BreadcrumbModule,ToolbarModule,InputTextModule,SplitButtonModule,CheckboxModule,ProgressSpinnerModule,DialogModule,CardModule,PasswordModule,ChipModule,InputSwitchModule
  ]
})
export class InterfaceClientModule { }
