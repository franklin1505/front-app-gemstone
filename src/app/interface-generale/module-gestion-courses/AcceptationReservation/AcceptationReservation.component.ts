import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { MessageService } from 'primeng/api';

declare var google: any;

@Component({
  selector: 'app-AcceptationReservation',
  templateUrl: './AcceptationReservation.component.html',
  styleUrls: ['./AcceptationReservation.component.css']
})
export class AcceptationReservationComponent implements OnInit {
  showConfirmationMessage: boolean = false;
  showAcceptMessage: boolean = false;
  showRejectMessage: boolean = false;
  identifiant: any;
  reservation: any;
  clientDetails: any;
  vehiculeDetails: any;
  loading: boolean = false;
  successMessage: string = '';
  form!: FormGroup;
  errorMessage: any;
  id: any;
  affectationData: any;
  urlList: any;
  urlPartenaire: string = ''; // Déclarez une variable pour stocker l'URL du partenaire
  @ViewChild('mapContainer', { static: false }) gmap!: ElementRef;
  map: any;
  lat = 45.75;
  lng = 4.85;
  affichageForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder,
    private _reservationService: CrmService
  ) {
    this.form = this.fb.group(
      {
        reservationId: ["", Validators.required],
        utilisateur_id: [""],
        email: ["", [Validators.email]],
        chauffeurExterneNom: [""],
        chauffeurExterneNumero: [""],
        coutDeVente: [null],
        commission: [null],
        compensation: [null],
      },
      { validators: this.validateUtilisateurOrEmail }
    );
    this.affichageForm = this.fb.group({
      supplements: [[]],
      passagers: [[]],
      notes: [[]],
    });

  }

  ngOnInit(): void {
    const pathSegments = window.location.pathname.split('/');
    const identifiant = pathSegments[pathSegments.length - 2]; // Avant-dernier élément
    const affectationDataEncoded = pathSegments[pathSegments.length - 1]; // Dernier élément

    try {
      const affectationDataDecoded = decodeURIComponent(affectationDataEncoded);
      this.affectationData = JSON.parse(affectationDataDecoded);
    } catch (error) {
      console.error('Erreur lors du décodage des données d\'affectation :', error);
      this.affectationData = null;
    }

    console.log('retourner', this.affectationData);
    this.id = identifiant;
    this.form.patchValue({
      reservationId: identifiant, // Utilisez patchValue pour pré-remplir uniquement ce champ
    });

    this.getReservation(identifiant);
    this.traiterAffectationData(this.affectationData);
    this.getUrlValues();
  }


  ngAfterViewInit(): void {
    this.initializeMap();
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
        this.clientDetails = reservation.utilisateur
        this.vehiculeDetails = reservation.vehicule;
        console.log(this.reservation);
        this.updateAffichageForm();
        this.displayRoute(reservation.lieuxPriseEnCharge, reservation.lieuxDestination);
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

  private getSupplements(): any[] {
    return this.reservation?.attribut?.filter((item: { quantite: number }) => item.quantite > 0) || [];
  }

  private getPassagers(): any[] {
    return this.reservation?.notes?.filter((note: { type: string }) => note.type === 'passenger') || [];
  }

  private getNotes(): any[] {
    return this.reservation?.notes?.filter((note: { type: string }) => note.type === 'note') || [];
  }

  traiterAffectationData(affectationData: any): void {
    if (!affectationData || typeof affectationData !== 'object') return;

    const type = affectationData.type;

    if (type === 'partenaire interne' && affectationData.utilisateur_id) {
      // Si c'est un partenaire interne avec un utilisateur_id
      this.form.patchValue({
        utilisateur_id: affectationData.utilisateur_id,
        coutDeVente: affectationData.coutDeVente,
        commission: affectationData.commission,
        compensation: affectationData.compensation,
      });
    } else if (type === 'chauffeur interne' && affectationData.utilisateur_id) {
      // Si c'est un chauffeur interne avec un utilisateur_id
      this.form.patchValue({
        utilisateur_id: affectationData.utilisateur_id,
        coutDeVente: affectationData.coutDeVente,
        commission: affectationData.commission,
        compensation: affectationData.compensation,
      });
    } else if (type === 'chauffeur externe' && affectationData.email) {
      // Si c'est un chauffeur externe avec un email
      this.form.patchValue({
        email: affectationData.email,
        chauffeurExterneNom: affectationData.dataChauffeurExterne.nom,
        chauffeurExterneNumero: affectationData.dataChauffeurExterne.numero,
        coutDeVente: affectationData.coutDeVente,
        commission: affectationData.commission,
        compensation: affectationData.compensation,
      });
    } else {
      console.error('Données affectationData invalides');
    }
  }

  fermerPage(): void {
    window.close();
  }

  acceptReservation(): void {
    if (this.form.valid) {
      const {
        reservationId,
        email,
        chauffeurExterneNom,
        chauffeurExterneNumero,
        utilisateur_id,
        coutDeVente,
        commission,
        compensation
      } = this.form.value;

      // Vérifiez que soit l'email soit l'utilisateur_id est fourni
      if (!email && !utilisateur_id) {
        console.error("Aucun identifiant d'utilisateur ou email fourni.");
        this.errorMessage = "Aucun identifiant d'utilisateur ou email fourni.";
        this.showError(this.errorMessage);
        return;
      }

      const dataChauffeurExterne = email
        ? { nom: chauffeurExterneNom, numero: chauffeurExterneNumero }
        : null;

      const data = {
        ...this.form.value,
        dataChauffeurExterne,
        coutDeVente,
        commission,
        compensation
      };

      this.loading = true;
      setTimeout(() => {
        this._reservationService.accepterReservation(reservationId, data).subscribe({
          next: (response) => {
            console.log('reponse', response);
            this.loading = false;
            this.showConfirmationMessage = true;
            this.showAcceptMessage = true;
            this.successMessage = 'La course a été acceptée avec succès.';
            this.showSuccess(this.successMessage);
          },
          error: (error) => {
            this.loading = false;
            console.error('erreur', error);
            this.errorMessage = 'Erreur survenue lors de l\'acceptation de la course';
            this.showError(this.errorMessage);
          },
        });
      }, 3000);
    }
  }


  rejectReservation() {
    this.loading = true;
    setTimeout(() => {
      this._reservationService.notifierRefus(this.id).subscribe(
        (response) => {
          console.log('reponse', response);
          this.loading = false;
          this.showConfirmationMessage = true;
          this.showRejectMessage = true;
        },
        (error) => {
          this.loading = false;
          console.error('erreur', error);
          this.errorMessage = error.error.error;
          this.showError(this.errorMessage)
        }
      );
    }, 1000);
  }


  validateUtilisateurOrEmail(formGroup: FormGroup): { [key: string]: boolean } | null {
    const utilisateurIdControl = formGroup.get('utilisateur_id');
    const emailControl = formGroup.get('email');

    if (!utilisateurIdControl || !emailControl) {
      return null;
    }
    const utilisateurIdValue = utilisateurIdControl.value;
    const emailValue = emailControl.value;
    if (!utilisateurIdValue && !emailValue) {
      return { utilisateurOrEmailRequired: true };
    }
    return null;
  }

  getUrlValues(): void {
    this._reservationService.getAllUrls().subscribe(
      (response) => {
        this.urlList = response;
        // Assurez-vous que response contient les données attendues de votre API
        if (this.urlList.length > 0) {
          // Supposons que vous utilisez le premier élément de la liste comme exemple
          this.urlPartenaire = this.urlList[0].url_partenaire || ''; // Utilisation de url_partenaire si défini
        }
      },
      (error) => {
        console.error('Error fetching urls values:', error);
      }
    );

  }

  redirectToPartner(): void {
    if (this.urlPartenaire) {
      window.location.href = this.urlPartenaire;
    } else {
      console.error('URL partenaire non définie.');
    }
  }

  getFormattedClientType(type: string): string {
    switch (type) {
      case "client_simple":
        return "Client Simple";
      case "client_societe":
        return "Client Société";
      case "client_agence":
        return "Client Agence";
      case "client_liee_societe":
        return "Client Liée à une Société";
      case "client_liee_agence":
        return "Client Liée à une Agence";
      default:
        return type;
    }

  }

  formatTypeBagages(type: string): string {
    switch (type) {
      case 'Cabine':
        return 'Bagage cabine';
      case 'M':
        return 'Valise moyenne';
      case 'L':
        return 'Valise large';
      case 'XL':
        return 'Valise extra-large';
      default:
        return type;
    }
  }


  formatCapaciteChargement(capaciteChargement: string): string {
    const [nombre, type] = capaciteChargement.split(' ');
    let typeDescription = '';

    switch (type) {
      case 'Cabine':
        typeDescription = 'Bagage cabine';
        break;
      case 'M':
        typeDescription = 'Valise moyenne';
        break;
      case 'L':
        typeDescription = 'Valise large';
        break;
      case 'XL':
        typeDescription = 'Valise extra-large';
        break;
      default:
        typeDescription = type;
    }

    return `${nombre} ${typeDescription}`;
  }

  formatPaymentMethodName(method: string): string {
    switch (method) {
      case 'payement_paypal':
        return 'Paiement par PayPal';
      case 'payement_stripe':
        return 'Paiement par Stripe';
      case 'payement_abord':
        return 'Paiement à bord (espèce ou CB)';
      case 'payement_virement':
        return 'Paiement par virement bancaire';
      case 'payment_en_compte':
        return 'Paiement en compte';
      default:
        return method;
    }
  }



  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

}

