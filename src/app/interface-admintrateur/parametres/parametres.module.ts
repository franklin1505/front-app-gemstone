import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParametresRoutingModule } from './parametres-routing.module';
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
import { ParametresDashboardComponent } from './parametres-dashboard/parametres-dashboard.component';
import { ParametreDialogComponent } from './parametre-dialog/parametre-dialog.component';
import { AddVehiculeComponent } from './data-parametres/add-vehicule/add-vehicule.component';
import { UpdateVehiculeComponent } from './data-parametres/update-vehicule/update-vehicule.component';
import { AddChauffeurComponent } from './data-parametres/add-chauffeur/add-chauffeur.component';
import { UpdateChauffeurComponent } from './data-parametres/update-chauffeur/update-chauffeur.component';
import { ViewChauffeurComponent } from './data-parametres/view-chauffeur/view-chauffeur.component';
import { ViewVehiculeComponent } from './data-parametres/view-vehicule/view-vehicule.component';
import { TarificationComponent } from './data-parametres/tarification/tarification.component';
import { MonEntrepriseComponent } from './data-parametres/mon-entreprise/mon-entreprise.component';
import { EntreprisePartenaireComponent } from './data-parametres/entreprise-partenaire/entreprise-partenaire.component';
import { GererEntreprisePartenaireComponent } from './data-parametres/gerer-entreprise-partenaire/gerer-entreprise-partenaire.component';
import { EditorModule } from 'primeng/editor';
import { ChauffeursExternesComponent } from './data-parametres/chauffeurs-externes/chauffeurs-externes.component';

@NgModule({
  declarations: [
    ParametresDashboardComponent,
    ParametreDialogComponent,
    AddVehiculeComponent,
    UpdateVehiculeComponent,
    AddChauffeurComponent,
    UpdateChauffeurComponent,
    ViewChauffeurComponent,
    ViewVehiculeComponent,
    TarificationComponent,
    MonEntrepriseComponent,
    EntreprisePartenaireComponent,
    GererEntreprisePartenaireComponent,
    ChauffeursExternesComponent
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  imports: [

    CommonModule,CalendarModule,InputGroupModule, InputGroupAddonModule,FloatLabelModule,InplaceModule,InputOtpModule,PanelModule,MenubarModule,ToggleButtonModule,
    MenuModule, BadgeModule, RippleModule,ButtonModule, AvatarModule,PaginatorModule,FileUploadModule,StepperModule,RatingModule,TabMenuModule,OverlayPanelModule,EditorModule,
    ParametresRoutingModule,DropdownModule,FormsModule,ReactiveFormsModule,TagModule,ConfirmPopupModule,DataViewModule,FieldsetModule,TabViewModule,AccordionModule,MultiSelectModule,
    BreadcrumbModule,ToolbarModule,InputTextModule,SplitButtonModule,CheckboxModule,ProgressSpinnerModule,DialogModule,CardModule,PasswordModule,ChipModule,InputSwitchModule
  ]

})
export class ParametresModule { }
