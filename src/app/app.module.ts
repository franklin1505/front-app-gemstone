import { MiseAJourResumeComponent } from './interface-generale/module-gestion-courses/miseAJourResume/miseAJourResume.component';
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { InputTextModule } from "primeng/inputtext";
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FooterComponent } from './interface-generale/interface/footer/footer.component';
import { HeaderComponent } from './interface-generale/interface/header/header.component';
import { TraitementCourseComponent } from './interface-generale/module-gestion-courses/traitement-course/traitement-course.component';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import { FeedbackComponent } from './interface-generale/module-gestion-courses/feedback/feedback.component';
import { AcceptationReservationComponent } from './interface-generale/module-gestion-courses/AcceptationReservation/AcceptationReservation.component';
import { LoginComponent } from './interface-generale/login/login.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthInterceptor } from './utilitaires/interceptor/AuthInterceptor';
import { ErrorInterceptor } from './utilitaires/interceptor/error-interceptor';
import { UtcDateInterceptor } from './utilitaires/interceptor/UtcDateInterceptor';
import { CrmService } from './utilitaires/services/crm.service';
import { WebsocketService } from './utilitaires/services/websocket.service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { AppLayoutModule } from './layout/app.layout.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MessagesModule } from 'primeng/messages';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AutoCompleteModule } from "primeng/autocomplete";
import { CalendarModule } from "primeng/calendar";
import { ChipsModule } from "primeng/chips";
import { ChipModule } from "primeng/chip";
import { DropdownModule } from "primeng/dropdown";
import { InputMaskModule } from "primeng/inputmask";
import { InputNumberModule } from "primeng/inputnumber";
import { CascadeSelectModule } from "primeng/cascadeselect";
import { MultiSelectModule } from "primeng/multiselect";
import { InputTextareaModule } from "primeng/inputtextarea";
import { RatingModule } from 'primeng/rating';
import { KnobModule } from 'primeng/knob';
import { ListboxModule } from 'primeng/listbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SliderModule } from 'primeng/slider';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { PasswordModule } from 'primeng/password';
import { InputOtpModule } from 'primeng/inputotp';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    TraitementCourseComponent,
    FeedbackComponent,
    MiseAJourResumeComponent,
    AcceptationReservationComponent,
    LoginComponent
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MenuModule,
    BadgeModule,
    RippleModule,
    AvatarModule,
    InputTextareaModule,
    CascadeSelectModule,
    ReactiveFormsModule,
    ButtonModule,
    SliderModule,
    ToastModule,
    InputOtpModule,
    AppLayoutModule,
    DragDropModule,
    MessagesModule,
    CommonModule,
    InputTextModule,
    ConfirmPopupModule,
    CardModule,
    InputTextModule,
    RadioButtonModule,
    MultiSelectModule,
		ToggleButtonModule,
    AutoCompleteModule,
		CalendarModule,
		ChipsModule,
		DropdownModule,
		InputMaskModule,
		InputNumberModule,
    RadioButtonModule,
		RatingModule,
		ChipModule,
		KnobModule,
		InputSwitchModule,
		ListboxModule,
		SelectButtonModule,
		CheckboxModule,
		InputGroupModule,
		InputGroupAddonModule,
    PasswordModule,
    ProgressSpinnerModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    provideHttpClient(withFetch()),
    CrmService,
    {provide: HTTP_INTERCEPTORS,useClass: AuthInterceptor,multi: true,},
    { provide: HTTP_INTERCEPTORS, useClass: UtcDateInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    DatePipe,
    WebsocketService,
    MessageService,
    ConfirmationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
