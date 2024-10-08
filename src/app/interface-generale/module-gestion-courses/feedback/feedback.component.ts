import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { timer } from 'rxjs';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  feedbackForm: FormGroup;
  isClient: boolean = false;
  isChauffeur: boolean = false;
  feedbackDetails: any;
  id: any;
  feedbackEnvoyeSucces: boolean = false;
  reservation: any;
 // Générer un tableau de 10 pour l'affichage des étoiles
  afficherAlerte: boolean = false;
  loading: boolean = false;
  commentaireEnregistre: boolean = false;
  successMessage!: string;
  errorMessage!: string;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private _reservationService: CrmService
  ) {
    this.feedbackForm = this.fb.group({
      points_fidelite: [0, [Validators.required, Validators.min(0)]],
      note_chauffeur: [1],
      commentaire_client: '',
      commentaire_chauffeur: '',
      commentaire_client_enregistre: false,
      commentaire_chauffeur_enregistre: false,
    });
  }

  ngOnInit(): void {
    const pathSegments = window.location.pathname.split('/');
    const typeUtilisateur = pathSegments[pathSegments.length - 1]; // Le dernier élément
    const identifiant = pathSegments[pathSegments.length - 2];
    this.id = identifiant;
    this.isClient = typeUtilisateur === 'client';
    this.isChauffeur = typeUtilisateur === 'chauffeur';
    this.getFeedbackDetails(identifiant);
  }

  getFeedbackDetails(feedbackId: any): void {
    this._reservationService.getFeedbackDetails(feedbackId).subscribe({
      next: (data) => {
        this.feedbackDetails = data;
        console.log(data);
        this.getReservation(data.reservation);
        this.verifierCommentaireEnregistre();
        // Ici, vous pouvez initialiser votre formulaire avec les données récupérées si nécessaire
      },
      error: (error) =>
        console.error(
          'Erreur lors de la récupération des détails du feedback:',
          error
        ),
    });
  }

  fermerPage(): void {
    window.close();
  }

  verifierCommentaireEnregistre(): void {
    if (this.isClient) {
      if (
        this.feedbackDetails &&
        this.feedbackDetails.commentaire_client_enregistre === true
      ) {
        this.commentaireEnregistre = true;
      }
    } else if (this.isChauffeur) {
      if (
        this.feedbackDetails &&
        this.feedbackDetails.commentaire_chauffeur_enregistre === true
      ) {
        this.commentaireEnregistre = true;
      }
    }
  }

  getReservation(identifiant: any) {
    this._reservationService
      .getReservation(identifiant)
      .subscribe((reservation) => {
        this.reservation = reservation;
        console.log(reservation);
      });
  }

  soumettreFeedback(): void {
    if (this.feedbackForm.valid) {
      let formData = {};
      // Calcul des points de fidélité et préparation des données de formulaire pour un client
      if (this.isClient) {
        const noteChauffeur = this.feedbackForm.get('note_chauffeur')?.value;
        const pointsFidelite = this.calculerPointsFidelite(noteChauffeur);
        // Construction de l'objet formData pour le client
        formData = {
          points_fidelite: pointsFidelite,
          note_chauffeur: noteChauffeur,
          commentaire_client:
            this.feedbackForm.get('commentaire_client')?.value,
          commentaire_client_enregistre: true,
        };
      }

      if (this.isChauffeur) {
        formData = {
          commentaire_chauffeur: this.feedbackForm.get('commentaire_chauffeur')
            ?.value,
          commentaire_chauffeur_enregistre: true,
        };
      }
      console.log(formData)
      this.loading = true;
      setTimeout(() => {

        this._reservationService.updateFeedback(this.id, formData).subscribe({
          next: (response) => {
            console.log('Feedback mis à jour avec succès', response);
            this.loading = false;
            this.successMessage = '🚀 Votre Feedback a été envoyé avec succès ! 🎉😄'
            this.showSuccess(this.successMessage);

            this.feedbackEnvoyeSucces = true;
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour du feedback', error);
            this.loading = false;
            this.errorMessage =  '😢 Une erreur est survenue lors de la soumission du feedback.'
            this.showError(this.errorMessage);
          },
        });
      }, 2500);
    }
  }

  calculerPointsFidelite(noteChauffeur: number): number {
    let pointsBase = noteChauffeur * 10; // Points de base calculés à partir de la note

    // Ajout de points supplémentaires en fonction de la note du chauffeur
    if (noteChauffeur >= 5 && noteChauffeur <= 6) {
      pointsBase += 5;
    } else if (noteChauffeur >= 7 && noteChauffeur <= 8) {
      pointsBase += 10;
    } else if (noteChauffeur >= 9 && noteChauffeur <= 10) {
      pointsBase += 20;
    }

    return pointsBase;
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }


}
