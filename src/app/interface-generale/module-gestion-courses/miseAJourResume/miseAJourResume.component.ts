import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CrmService } from '../../../utilitaires/services/crm.service';

declare var google: any;

@Component({
  selector: 'app-miseAJourResume',
  templateUrl: './miseAJourResume.component.html',
  styleUrls: ['./miseAJourResume.component.css']
})
export class MiseAJourResumeComponent  implements OnInit, OnDestroy {
  ids: number[] = [];
  reservations: any[] = [];
  rendezVousForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  courseEnCours: boolean = false;
  isSaving: boolean = false; // Indique si une sauvegarde est en cours
  loading: boolean = false;
  affichageForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private _reservationService: CrmService
  ) {
    this.affichageForm = this.fb.group({
      supplements: [[]],
      passagers: [[]],
      notes: [[]],
    });
  }

  ngOnInit(): void {
    this.getIdsFromRoute();
    this.initializeForm();
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.intercepteRafraichissement);
  }

  @HostListener('window:beforeunload', ['$event'])
  intercepteRafraichissement(event: BeforeUnloadEvent): void {
    if (this.courseEnCours) {
      event.preventDefault();
      event.returnValue = ''; // Nécessaire pour afficher la boîte de dialogue
    }
  }

  getIdsFromRoute(): void {
    const pathSegments = window.location.pathname.split('/');
    const idsString = pathSegments[2];
    if (idsString) {
      this.ids = idsString.split(',').map(Number);
      this.getReservations();
      this.courseEnCours = true; // Action en cours, empêcher la fermeture
    } else {
      console.error('No IDs found in URL');
    }
  }


  getReservations(): void {
    if (this.ids.length > 0) {
      this._reservationService.getReservationsByIds(this.ids).subscribe(
        reservations => {
          this.reservations = reservations.map((reservation: any) => ({
            ...reservation,
            supplements: this.getSupplements(reservation),
            passagers: this.getPassagers(reservation),
            notes: this.getNotes(reservation)
          }));
          this.addFormControls();
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  private getSupplements(reservation: any): any[] {
    return reservation.attribut?.filter((item: { quantite: number }) => item.quantite > 0) || [];
  }

  private getPassagers(reservation: any): any[] {
    return reservation.notes?.filter((note: { type: string }) => note.type === 'passenger') || [];
  }

  private getNotes(reservation: any): any[] {
    return reservation.notes?.filter((note: { type: string }) => note.type === 'note') || [];
  }

  initializeForm(): void {
    this.rendezVousForm = this.fb.group({});
  }

  addFormControls(): void {
    this.reservations.forEach(reservation => {
      const lieuRendezVous = reservation.lieu_rendez_vous || ''; // Valeur par défaut si non défini
      this.rendezVousForm.addControl(
        `pointRendezVous-${reservation.id}`,
        this.fb.control(lieuRendezVous, Validators.required)
      );
    });
  }

  initAutocomplete(event: FocusEvent, reservationId: number): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && !inputElement.getAttribute('data-autocomplete-initialized')) {
      const addressAutocomplete = new google.maps.places.Autocomplete(inputElement, {
        types: [] // Vous pouvez spécifier des types comme ['geocode'] si nécessaire
      });
      inputElement.setAttribute('data-autocomplete-initialized', 'true');

      addressAutocomplete.addListener('place_changed', () => {
        // Utiliser directement l'input de l'utilisateur
        this.rendezVousForm.patchValue({ [`pointRendezVous-${reservationId}`]: inputElement.value });
      });
    }
  }



  areAllFieldsFilled(): boolean {
    return this.reservations.every(reservation => {
      const control = this.rendezVousForm.get(`pointRendezVous-${reservation.id}`);
      return control && control.value.trim() !== '';
    });
  }

  savePointsRendezVous(): void {
    if (this.areAllFieldsFilled() && !this.isSaving) {
      this.isSaving = true; // Démarre la sauvegarde
      this.loading = true;
      const pointsRendezVous = this.reservations.reduce((acc, reservation) => {
        acc[reservation.id] = this.rendezVousForm.get(`pointRendezVous-${reservation.id}`)?.value;
        return acc;
      }, {} as { [key: number]: string });

      this._reservationService.updateLieuRendezVous(pointsRendezVous).subscribe(
        response => {
          this.successMessage = 'Les lieux de rendez-vous ont été mis à jour avec succès.';
          this.showSuccess(this.successMessage);
          this.courseEnCours = false; // Terminer l'action critique
          this.loading = false;
          // Fermer la page après 5 secondes
          setTimeout(() => {
            window.close(); // Ferme la fenêtre actuelle
          }, 2000);
        },
        (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.error || 'Une erreur est survenue lors de la mise à jour des lieux de rendez-vous.';
          this.showError(this.errorMessage);
          this.loading = false;
          this.isSaving = false; // Réinitialiser l'état de sauvegarde en cas d'erreur
        },
        () => {
          this.isSaving = false; // Réinitialiser l'état de sauvegarde après l'opération
        }
      );
    }
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }
}

