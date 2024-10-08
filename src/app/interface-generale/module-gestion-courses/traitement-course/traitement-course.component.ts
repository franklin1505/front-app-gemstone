import { Component, ElementRef, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CrmService } from '../../../utilitaires/services/crm.service';

declare var google: any;

@Component({
  selector: 'app-traitement-course',
  templateUrl: './traitement-course.component.html',
  styleUrls: ['./traitement-course.component.css'],
})
export class TraitementCourseComponent implements OnInit, OnDestroy {
  reservation: any;
  affichageForm: FormGroup;
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  afficherAlerteDemarrage: boolean = false;
  courseEnCours: boolean = false; // Bloquer le rafraîchissement pendant "en approche"
  courseActive: boolean = false;  // Activer le bouton "Terminer la course"
  courseTerminee: boolean = false;
  countdownInterval: any;
  @ViewChild('mapContainer', { static: false }) gmap!: ElementRef;
  map: any;
  lat = 45.75;
  lng = 4.85;
  countdownText: string = '';
  pageBoquer: boolean = false;
  durationCountdownText!: string;
;

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
    const pathSegments = window.location.pathname.split('/');
    const identifiant = pathSegments[pathSegments.length - 1];
    this.getReservation(identifiant);
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private initializeMap(): void {
    const mapOptions = {
      center: new google.maps.LatLng(this.lat, this.lng),
      zoom: 10,
    };
    this.map = new google.maps.Map(this.gmap.nativeElement, mapOptions);
  }

  private getReservation(identifiant: any): void {
    this._reservationService.getReservation(identifiant).subscribe(
      (reservation) => {
        this.reservation = reservation;
        console.log(this.reservation);
        this.updateAffichageForm();
        this.displayRoute(reservation.lieuxPriseEnCharge, reservation.lieuxDestination);

        if (this.reservation.statutReservation === 'terminer') {
          this.courseTerminee = true;
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération de la réservation', error);
        this.showError('Erreur lors de la récupération de la réservation');
      }
    );
  }

  private updateAffichageForm(): void {
    if (this.reservation) {
      this.affichageForm.patchValue({
        supplements: this.getSupplements(),
        passagers: this.getPassagers(),
        notes: this.getNotes(),
      });
    }
  }

  private getSupplements(): any[] {
    return this.reservation?.attribut?.filter((item: { quantite: number }) => item.quantite > 0) || [];
  }

  private getPassagers(): any[] {
    return this.reservation?.notes?.filter((note: { type: string }) => note.type === 'passenger') || [];
  }

  private getNotes(): any[] {
    return this.reservation?.notes?.filter((note: { type: string }) => note.type === 'note') || [];
  }

  formatPaymentMethodName(method: string): string {
    const methodMap: { [key: string]: string } = {
      'payement_paypal': 'Paiement par PayPal',
      'payement_stripe': 'Paiement par Stripe',
      'payement_abord': 'Paiement à bord (espèce ou CB)',
      'payement_virement': 'Paiement par virement bancaire',
      'payment_en_compte': 'Paiement en compte',
    };
    return methodMap[method] || method;
  }

  private displayRoute(start: string, end: string): void {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map });
    directionsService.route(
      { origin: start, destination: end, travelMode: google.maps.TravelMode.DRIVING },
      (result: any, status: any) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          console.error('Erreur de routage:', status);
        }
      }
    );
  }

  private showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 2000 });
  }

  private showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 5000 });
  }

  changeReservationStatus(action: string): void {
    if (!this.reservation) return;

    this.loading = true;
    this._reservationService.updateReservationStatus(this.reservation.id, action).subscribe(
      (response) => {
        this.loading = false;
        this.successMessage = 'Statut de la réservation mis à jour avec succès.';
        this.showSuccess(this.successMessage);
        this.reservation.statutReservation = response.statutReservation;

        if (action === 'en_approche') {
          this.courseEnCours = true;
          this.startCountdown(); // Pour "en approche"
        } else if (action === 'en_cours') {
          this.courseActive = true; // Activer le suivi de la durée
          this.startCourseDurationCountdown(); // Pour "en cours"
        } else if (action === 'terminer') {
          this.terminerCourse();
        }
      },
      (error) => {
        this.loading = false;
        console.error(error);
        this.errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
        this.showError(this.errorMessage);
      }
    );
  }

  private startCourseDurationCountdown(): void {
    const [hours, minutes] = this.parseDuration(this.reservation.duree);
    const now = new Date().getTime();
    const endTime = now + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);

    this.requestPermission();


    this.countdownInterval = setInterval(() => {
      const currentTime = new Date().getTime();
      const remainingTime = endTime - currentTime;

      if (remainingTime <= 0) {
        clearInterval(this.countdownInterval);
        this.courseActive = false; // Le temps est écoulé, on peut terminer la course
        this.durationCountdownText = 'Terminer la course';
        this.showNotification('Notification', '⏰ Le temps de la course est écoulé. Veuillez finaliser la course. Merci !');
      } else {
        this.courseActive = true; // Le temps n'est pas encore écoulé
        const minutesLeft = Math.floor(remainingTime / 60000);
        const secondsLeft = Math.floor((remainingTime % 60000) / 1000);
        this.durationCountdownText = `La course finira dans : ${minutesLeft}m ${secondsLeft}s`;
      }
    }, 1000);
  }

  private parseDuration(duration: string): [number, number] {
    const timeParts = duration.match(/(\d+)\s*hours?\s*(\d+)\s*mins?/i);
    if (timeParts) {
      const hours = parseInt(timeParts[1], 10) || 0;
      const minutes = parseInt(timeParts[2], 10) || 0;
      return [hours, minutes];
    }
    const minsOnly = duration.match(/(\d+)\s*mins?/i);
    if (minsOnly) {
      return [0, parseInt(minsOnly[1], 10)];
    }
    return [0, 0]; // Cas par défaut
  }

  private startCountdown(): void {
    const datePriseEnCharge = new Date(this.reservation.datePriseEnCharge).getTime();
    this.requestPermission();

    const now = new Date().getTime();
    const initialDiff = datePriseEnCharge - now;
    const initialMinutes = Math.floor(initialDiff / 60000);
    const initialSeconds = Math.floor((initialDiff % 60000) / 1000);

    this.showNotification('Notification', `🚀 La course commencera dans : ${initialMinutes}m ${initialSeconds}s`);

    this.countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const diff = datePriseEnCharge - now;

      if (diff <= 0) {
        clearInterval(this.countdownInterval);
        this.afficherAlerteDemarrage = false;
        this.courseEnCours = false;
        this.countdownText = 'Démarrer la course';
        this.showNotification('Notification', '🔥 C\'est le moment de démarrer la course !');
      } else {
        this.afficherAlerteDemarrage = true;
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        this.countdownText = `🚀 La course commencera dans : ${minutes}m ${seconds}s`;

      }
    }, 1000);
  }

  private terminerCourse(): void {
    this.courseTerminee = true;
    this.pageBoquer = false;
    this.courseActive = false;
    this.showNotification('Notification', '🎉 Félicitations pour avoir complété la course ! Nous espérons vous retrouver bientôt pour une nouvelle course.');
  }

  quitter(): void {
    window.close();
  }

  requestPermission() {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Permission de notification accordée.');
      } else {
        console.log('Permission de notification refusée.');
      }
    });
  }

  showNotification(title: string, body: string) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
      });
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  intercepteRafraichissement($event: any): void {
    if (this.pageBoquer) {
      $event.returnValue = true;
    }
  }
}
