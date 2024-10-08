import { Reservation } from './../../../utilitaires/models/reservation';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService, SelectItem } from 'primeng/api';
import { combineLatest, debounceTime, map, Observable, startWith, Subscription } from 'rxjs';
import { Methode } from '../../../utilitaires/models/parametres';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { WebsocketService } from '../../../utilitaires/services/websocket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginatorState } from 'primeng/paginator';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { environment } from '../../../../environments/environment';

declare var google: any;

enum Frequency {
  day = "DAILY",
  week = "WEEKLY",
  month = "MONTHLY",
  year = "YEARLY",
}

interface StatusTag {
  severity?: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
  value: string;
}


@Component({
  selector: 'app-view-reservation',
  templateUrl: './view-reservation.component.html',
  styleUrls: ['./view-reservation.component.css']
})
export class ViewReservationComponent implements OnInit, OnDestroy {
  visible: boolean = false;
  isCourseRetourVisible: boolean = false;
  isCourseDuppliquerVisible: boolean = false;
  isCourseReppeterVisible: boolean = false;
  repetitionOptions: { label: string, value: string }[] = [];

  first: number = 0;
  rows: number = 20;
  selectedFile: File | null = null;

  items!: MenuItem[];
  breadcrumbItems: MenuItem[] = [];
  menuItems: MenuItem[] = [];

  reservations: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  currentReservationType: string = '';
  messageNoData: string = '';


  searchResult: any[] = [];
  Result: any[] = [];
  searchTerm: string = "";
  message = "";
  isAuthenticated: boolean = false;
  restoreVisible: boolean = false;
  itemsPerPage: number = 20; // Nombre de réservations par page
  loading: boolean = false;
  showResults: boolean = false;
  compensationEnabled = true;
  coutVente: any;
  vehiculeData: any;
  clients: any;
  date: any;
  weekDayLabel: string = "";
  monthlyLabel: string = "";
  annualLabel: string = "";
  reserverForm: FormGroup;
  reservation: any
  data: any;
  resultCount: { beforeToday: number; today: number; afterToday: number; cancelled: number; archived: number; total: number; } =
    { beforeToday: 0, archived: 0, today: 0, total: 0, afterToday: 0, cancelled: 0 };
  @ViewChild("content") modalContent: any;
  afficherChauffeurInterne = false;
  afficherChauffeurExterne = false;
  afficherEntreprisePartenaire = false;
  afficherDirect = false;
  @ViewChild("customContent") customContent: any;
  @ViewChild("contentArchive") contentArchive: any;
  courseRetourForm: FormGroup;
  chauffeurs: any;
  form: FormGroup;
  calForm: FormGroup;
  entrepriseList: any;
  entreprisePartenaire: any;
  errorMessage = "";
  successMessage = "";
  triDateAscendant = true; // Contrôle le tri ascendant ou descendant pour la date
  triStatutAscendant = true; // Contrôle le tri ascendant ou descendant pour le statut
  triNomAscendant = true;
  cout: any;
  selectedReservations: Set<number> = new Set(); // Stocker les IDs des réservations sélectionnées
  clientReferenceId: number | null = null;
  paymentMethods: any[] = [];
  clientOriginale: any;
  eventForm: FormGroup;
  customRecurrenceForm: FormGroup;
  reservationId: any;
  currentAction!: string;
  reservationsFilters: any[] = [];
  filterForm!: FormGroup;
  isCommissionByAmount: boolean = false;
  allSelected = false;

  filterOptions: { key: string; description: string }[] = [
    { key: "datePriseEnCharge", description: "Filtrer par date de prise en charge" },
    { key: "lieuxPriseEnCharge", description: "Filtrer par adresse de départ" },
    { key: "utilisateur_last_name", description: "Filtrer par nom" },
    { key: "utilisateur_first_name", description: "Filtrer par prénom" },
    { key: "utilisateur_telephone", description: "Filtrer par téléphone " },
    { key: "utilisateur_email", description: "Filtrer par email " },
    { key: "vehicule_marque", description: "Filtrer par marque du véhicule" },
    { key: "vehicule_modele", description: "Filtrer par modèle du véhicule" },
    { key: "vehicule_typeVehicule", description: "Filtrer par type de véhicule" },
    { key: "nombreBagage", description: "Filtrer par nombre de bagages" },
    { key: "nombrePassager", description: "Filtrer par nombre de passagers" },
    { key: "compagnieAerienne", description: "Filtrer par numéro de vol ou train" },
    { key: "societe", description: "Filtrer par société" },
    { key: "modePaiement", description: "Filtrer par mode de paiement" },
    { key: "coutTransport", description: "Filtrer par coût du trajet" },
    { key: "lieuxDestination", description: "Filtrer par adresse de arrivé" },
    { key: "distance", description: "Filtrer par distance" },
    { key: "coutTotalReservation", description: "Filtrer par coût total de la course" },
    { key: "numero_reservation", description: "Filtrer par numéro de réservation" },
    { key: "numero_dossier", description: "Filtrer par numéro de dossier" },
    { key: "statutReservation", description: "Filtrer par statut de réservation" },
    { key: "etat", description: "Filtrer par état" }
  ];

  filterItems: SelectItem[] = [];
  selectedFilterKey: string = '';
  filterValue: string = '';
  ChauffeurInterne = true;
  ChauffeurExterne = false;
  EntreprisePartenaire = false;
  selectedIds: any;
  type_bagages: any;
  capaciteChargement: any;
  private subscription!: Subscription;
  userType!: string | null;
  isCustom: boolean = false;
  isContent: boolean = false;

  // constructeur
  constructor(
    private fb: FormBuilder,
    private _estimationService: CrmService,
    private _reservationService: CrmService,
    private messageService: MessageService,
    private websocketService: WebsocketService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {

    this.filterItems = this.filterOptions.map(option => ({
      label: option.description,
      value: option.key
    }));

    this.courseRetourForm = this.fb.group({
      id: ['', Validators.required],
      depart: ['', Validators.required],
      arrive: ['', Validators.required],
      lieu_rendez_vous: ['', Validators.required],
      datePriseEnChargeDate: ['', Validators.required],
      datePriseEnChargeTime: ['', Validators.required],
      coutTotalReservation: ['', Validators.required],
    });

    this.form = this.fb.group(
      {
        reservationId: ["", Validators.required],
        utilisateur_id: [""],
        email: ["", [Validators.email]],
        chauffeurExterneNom: [""],
        chauffeurExterneNumero: [""],
      }
    );

    this.customRecurrenceForm = this.fb.group({
      repeatEvery: [1, Validators.min(1)],
      repeatType: ["day"],
      ends: ["never"],
      endDate: [
        { value: new Date().toISOString().substring(0, 10), disabled: true },
      ], // Date actuelle par défaut
      occurrences: [{ value: 30, disabled: true }],
    });

    this.customRecurrenceForm.get("ends")?.valueChanges.subscribe((value) => {
      if (value === "on") {
        this.customRecurrenceForm.get("endDate")?.enable();
      } else {
        this.customRecurrenceForm.get("endDate")?.disable();
      }
      if (value === "after") {
        this.customRecurrenceForm.get("occurrences")?.enable();
      } else {
        this.customRecurrenceForm.get("occurrences")?.disable();
      }
    });

    this.eventForm = this.fb.group({
      datePriseEnCharge: [{ value: "", disabled: true }],
      heurePriseEnCharge: [{ value: "", disabled: true }],
      nombreOccurrences: [1],
      regleRepetition: ["daily"],
      end_recurring_period: [""],
    });

    this.calForm = this.fb.group({
      commission: 10,
      compensation: 0,
      coutDeVente: 0,
      commissionAmount: 0,
    });


    this.reserverForm = this.fb.group({
      // donnees a pre remplir
      numero_reservation: [''],
      numero_Devis: [''],
      utilisateur: [''],
      client_selectionne: [''],
      datePriseEnCharge: ['', Validators.required],
      dateRetour: [''],
      coutTransport: ['', Validators.required],
      coutMajorer: ['', Validators.required],
      lieuxPriseEnCharge: ['', Validators.required],
      lieuxDestination: ['', Validators.required],
      distance: ['', Validators.required],
      duree: ['', Validators.required],
      typeReservation: ['', Validators.required],
      vehicule: [null, Validators.required],
      distanceWaypoint: [null],
      dureeWaypoint: [null],
      destinationInputs: this.fb.array([]),
      coutTotalReservation: ['', Validators.required],
      totalAttributCost: ['', Validators.required],
      // donnees a recuperer grace au formulaire
      attribut: this.fb.array([]),
      notes: this.fb.array([]),
      nombreBagage: [''],
      nombrePassager: ['', Validators.required],
      compagnieAerienne: [''],
      modePaiement: ['', Validators.required],
      statutReservation: ['', Validators.required],
      numero_dossier: [''],

      datePriseEnChargeDate: ['', Validators.required],
      datePriseEnChargeTime: ['', Validators.required],
      nbre: ['', Validators.required],
      passengers: this.fb.array([]),
      note: [''],
      vehiculeView: [''],
      lieu_rendez_vous: ['', Validators.required],
      commission: [10],
      compensation: [0],
      commissionAmount: [0],
      coutDeVente: [''],
    });
  }


  ngOnInit() {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Reservations' });
    this.setupOperationItems();
    this.connectToWebSocket();
    this.getEntreprise();
    this.getEntreprisePartenaire();
    this.setupCostCalculation();
    this.route.queryParams.subscribe((params: { [x: string]: string; }) => {
      this.currentReservationType = params['filter'] || 'total';
      this.updateBreadcrumbTitle();
      this.getReservations(this.currentPage, this.currentReservationType); // Recharger les réservations
    });
  }

  updateBreadcrumbTitle(): void {
    switch (this.currentReservationType) {
      case 'beforeToday':
        this.messageNoData = "Désolé, pas de courses antérieures 🙂";
        this.breadcrumbItems.push({ label: 'Courses antérieures' });
        break;
      case 'today':
        this.messageNoData = "Désolé, pas de courses aujourd'hui 🙂";
        this.breadcrumbItems.push({ label: 'Courses du jour' });
        break;
      case 'afterToday':
        this.messageNoData = "Désolé, pas de courses à venir 🙂";
        this.breadcrumbItems.push({ label: 'Courses à venir' });
        break;
      case 'reglees':  // Ajout pour les courses réglées
        this.messageNoData = "Désolé, pas de courses traitées et payées 🙂";
        this.breadcrumbItems.push({ label: 'Courses réglées' });
        break;
      case 'non_reglees':  // Ajout pour les courses non réglées
        this.messageNoData = "Désolé, pas de courses traitées non payées 🙂";
        this.breadcrumbItems.push({ label: 'Courses non réglées' });
        break;
      default:
        this.messageNoData = "Désolé, pas de courses disponibles 🙂";
        this.breadcrumbItems.push({ label: 'Toutes les courses' });
    }
  }

  getText(isRegler: boolean): string {
    return isRegler ? 'Course Réglée' : 'Course Non Réglée';
  }

  getTag(isRegler: boolean): 'success' | 'danger' {
    return isRegler ? 'success' : 'danger';  // Vert pour réglée, rouge pour non réglée
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/reservations']);
  }

  // Fonction pour demander la permission de notification
  requestPermission() {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Permission de notification accordée.');
      } else {
        console.log('Permission de notification refusée.');
      }
    });
  }
  // Fonction pour afficher une notification
  showNotification() {
    this.requestPermission(); // Demande la permission si elle n'a pas encore été accordée
    // Vérifie si la permission est accordée
    if (Notification.permission === 'granted') {
      // Affiche la notification
      new Notification('Titre de la notification', {
        body: '🔥Ceci est le corps de la notification.',
      });
    } else {
      console.log('Les notifications ne sont pas autorisées.');
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.websocketService.close();
  }


  connectToWebSocket(): void {
    const wsUrl = environment.wsUrl;
    this.websocketService.connect(wsUrl);
    this.subscription = this.websocketService.onMessage().subscribe(message => {
      if (message.type === 'status_update') {
        this.getReservations(this.currentPage, this.currentReservationType); // Recharger les réservations
      } else if (message.type === 'facturation_update') {
        this.getReservations(this.currentPage, this.currentReservationType); // Recharger les réservations
      } else if (message.type === 'annulation_update') {
        this.getReservations(this.currentPage, this.currentReservationType); // Recharger les réservations
      }
    });
  }

  get passengers(): FormArray {
    return this.reserverForm.get('passengers') as FormArray;
  }

  addPassenger(): void {
    if (this.passengers.invalid) {
      const alertMessage = 'Veuillez remplir tous les champs de passagers avant d\'ajouter un autre passager.';
      this.showError(alertMessage)
      return;
    }
    this.passengers.push(this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required]
    }));
  }

  removePassenger(index: number): void {
    this.passengers.removeAt(index);
  }

  getCalculateCounts(): void {
    this._estimationService.getCalculateCounts().subscribe((data: any) => {
      this.resultCount = data;
    });
  }

  toggleCommissionInput() {
    this.isCommissionByAmount = !this.isCommissionByAmount;
  }

  genererFacture(): void {
    this.loading = true;
    setTimeout(() => {
      if (this.selectedReservations.size > 0) {
        // Vérifier si une des réservations sélectionnées a déjà été facturée
        const reservationsDejaFacturees = this.getReservationsForCurrentPage().filter(reservation =>
          this.selectedReservations.has(reservation.id) && reservation.statut_facturation === 'facture'
        );

        if (reservationsDejaFacturees.length > 0) {
          this.loading = false;
          this.message = "Certaines réservations sélectionnées ont déjà été facturées. Vous ne pouvez pas les facturer à nouveau.";
          this.showError(this.message);
        } else {
          // Si aucune réservation n'est déjà facturée, procéder à la génération de la facture
          this.loading = false;
          this._estimationService.setReservationIds(
            Array.from(this.selectedReservations)
          );
          this.router.navigate(["/app/factures/generer-facture"]);
        }
      } else {
        this.loading = false;
        this.message = "Veuillez sélectionner au moins une réservation.";
        this.showError(this.message);
      }
    }, 2000);
  }


  reload() {
    window.location.reload();
  }


  restaurerAnnulerReservation(id: any, action: "cancel" | "restore") {
    this.loading = true;
    setTimeout(() => {
      this._reservationService.annulerReservation(id, action).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = "Réservation restaurer avec succès";
          this.showSuccess(this.successMessage)
          this.router.navigate(['/app/reservations'])
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = "Erreur lors de la restaurer de la réservation";
          this.showError(this.errorMessage)
          console.error(
            "Erreur lors de la mise à jour de la réservation :",
            error
          );
          // Gérer l'erreur
        },
      });
    }, 1000);
  }

  genererNumeroReservation(data: any): string {
    const anneeCourante = new Date().getFullYear();
    // Obtenez les deux premières lettres du lieu de prise en charge et de destination
    const lieuPriseEnCharge = data.lieuxPriseEnCharge
      .substring(0, 2)
      .toUpperCase();
    const lieuDestination = data.lieuxDestination.substring(0, 2).toUpperCase();
    // Obtenez le nombre de passagers et de bagages
    const nombrePassager = data.nombrePassager || 0;
    const nombreBagage = data.nombreBagage || 0;
    // Générez le numéro de réservation dans le format souhaité
    const numeroReservation = `${anneeCourante}RD${data.utilisateur}${lieuPriseEnCharge}${lieuDestination}${nombrePassager}${nombreBagage}`;
    return numeroReservation;
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

  initAutocomplete() {
    // Champ pour l'adresse de départ
    const departAddressInput = document.getElementById(
      "lieuxPriseEnChargeInput"
    ) as HTMLInputElement;
    const departAddressAutocomplete = new google.maps.places.Autocomplete(
      departAddressInput,
      {
        types: [],
      }
    );
    departAddressAutocomplete.addListener("place_changed", () => {
      // Utiliser la valeur directe de l'input au lieu de `place.formatted_address`
      this.reserverForm.patchValue({
        lieuxPriseEnCharge: departAddressInput.value,
      });
    });

    // Champ pour l'adresse de destination
    const destinationAddressInput = document.getElementById(
      "lieuxDestinationInput"
    ) as HTMLInputElement;
    const destinationAddressAutocomplete = new google.maps.places.Autocomplete(
      destinationAddressInput,
      {
        types: [],
      }
    );
    destinationAddressAutocomplete.addListener("place_changed", () => {
      // Utiliser la valeur directe de l'input au lieu de `place.formatted_address`
      this.reserverForm.patchValue({
        lieuxDestination: destinationAddressInput.value,
      });
    });

    // Traitement similaire pour les adresses intermédiaires...
  }

  getVehiculeAndClient(vehicule: any) {
    this._estimationService
      .getVehiculeDetail(vehicule)
      .subscribe((vehicule) => {
        this.vehiculeData = vehicule;
        this.updateVehiculeNameInput(
          `${vehicule.marque} ${vehicule.modele} (${vehicule.typeVehicule})`
        );
      });
  }

  updateClientNameInput(fullName: string): void {
    this.reserverForm.patchValue({
      utilisateur: fullName,
    });
  }

  updateVehiculeNameInput(fullName: string): void {
    this.reserverForm.patchValue({
      vehiculeView: fullName,
    });
  }

  private formatPaymentMethodName(method: string): string {
    switch (method) {
      case "payement_paypal":
        return "Paiement par PayPal";
      case "payement_stripe":
        return "Paiement par Stripe";
      case "payement_abord":
        return "Paiement à bord (espèce ou CB)";
      case "payement_virement":
        return "Paiement par virement bancaire";
      case "payment_en_compte":
        return "Paiement en compte";
      default:
        return method;
    }
  }

  get attributsFormArray(): FormArray {
    return this.reserverForm.get("attribut") as FormArray;
  }

  setupCostCalculation() {
    // Ensure that the FormControls exist by using the optional chaining operator (?.)
    const coutTransport$ = this.reserverForm
      .get("coutTransport")
      ?.valueChanges.pipe(
        startWith(this.reserverForm.get("coutTransport")?.value || 0)
      );
    const coutMajorer$ = this.reserverForm
      .get("coutMajorer")
      ?.valueChanges.pipe(
        startWith(this.reserverForm.get("coutMajorer")?.value || 0)
      );
    const totalAttributCost$ = this.reserverForm
      .get("totalAttributCost")
      ?.valueChanges.pipe(
        startWith(this.reserverForm.get("totalAttributCost")?.value || 0)
      );

    // Use combineLatest only if all observables are defined
    if (coutTransport$ && coutMajorer$ && totalAttributCost$) {
      combineLatest([coutTransport$, coutMajorer$, totalAttributCost$])
        .pipe(
          map(([coutTransport, coutMajorer, totalAttributCost]) => {
            // Ensure all values are numbers and calculate the total
            return (coutTransport || 0) + (coutMajorer || 0) + (totalAttributCost || 0);
          })
        )
        .subscribe((coutTotal) => {
          // Update coutTotalReservation with the calculated total
          this.reserverForm
            .get("coutTotalReservation")
            ?.setValue(coutTotal, { emitEvent: false });

          // Calculate the 10% commission and store in coutDeVente
          const commission = coutTotal * 0.10;
          const coutDeVente = coutTotal - commission;

          // Update coutDeVente with the calculated value
          this.reserverForm
            .get("coutDeVente")
            ?.setValue(coutDeVente, { emitEvent: false });
        });
    }
  }


  /* debut des methodes corrigés et optimisés */

  // Exemple d'utilisation de toast
  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  getRibbonText(statutFacturation: string): string {
    switch (statutFacturation) {
      case 'pas_facture':
        return 'Non Facturé';
      case 'facture_demandee':
        return 'Facture Demandée';
      case 'facture':
        return 'Facturé';
      default:
        return '';
    }
  }

  getAnnulationRibbonText(statutAnnulation: string): string {
    switch (statutAnnulation) {
      case 'demande_annulation':
        return 'Demande d\'Annulation';
      case 'demande_restauration':
        return 'Demande de Restauration';
      case 'annule':
        return 'Annulé';
      default:
        return 'verifcation';
    }
  }

  getTagSeverity(statut: string, type: 'facturation' | 'annulation'): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    if (type === 'facturation') {
      switch (statut) {
        case 'pas_facture':
          return 'danger';
        case 'facture_demandee':
          return 'warning';
        case 'facture':
          return 'success';
        default:
          return undefined;
      }
    } else if (type === 'annulation') {
      switch (statut) {
        case 'demande_annulation':
          return 'warning';
        case 'demande_restauration':
          return 'info';
        case 'annule':
          return 'danger';
        default:
          return undefined;
      }
    } else {
      return undefined;
    }
  }

  getStatusTag(reservation: any): StatusTag {
    if (!reservation.etat) {
      return { severity: 'danger', value: 'Annulé' };
    }

    let severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined;
    switch (reservation.statutReservation) {
      case 'en_attente':
      case 'non_affecter':
        severity = 'danger';
        break;
      case 'terminer':
        severity = 'success';
        break;
      case 'affecter_a_chauffeur':
        severity = 'info';
        break;
      case 'en_traitement':
        severity = 'secondary';
        break;
      case 'affecter_a_partenaire':
        severity = 'info';
        break;
      case 'chauffeur_notifier':
        severity = 'warning';
        break;
      case 'en_cours':
        severity = undefined; // Pas de severity pour "en_cours"
        break;
      default:
        severity = 'contrast';
    }

    return { severity, value: this.getFormattedStatus(reservation.statutReservation) };
  }

  getCardClasses(reservation: any): string {
    switch (reservation.statutReservation) {
      case 'en_attente':
      case 'non_affecter':
        return 'bg-label-danger text-white';
      case 'terminer':
        return 'bg-label-success text-white';
      case 'affecter_a_chauffeur':
        return 'bg-label-info text-white';
      case 'en_traitement':
        return 'bg-label-secondary text-white';
      case 'affecter_a_partenaire':
        return 'bg-label-info text-white';
      case 'chauffeur_notifier':
        return 'bg-label-warning text-dark';
      case 'en_approche':
        return 'bg-label-white text-dark';
      case 'en_cours':
        return 'bg-label-primary text-white';
      default:
        return '';
    }
  }

  getFormattedStatus(status: string): string {
    switch (status) {
      case 'en_attente':
        return 'En Attente';
      case 'en_traitement':
        return 'En Traitement';
      case 'affecter_a_chauffeur':
        return 'Affecté à Chauffeur';
      case 'affecter_a_partenaire':
        return 'Affecté à Partenaire';
      case 'non_affecter':
        return 'Non Affecté';
      case 'chauffeur_notifier':
        return 'Chauffeur Notifié';
      case 'confirmer':
        return 'Confirmé';
      case 'en_cours':
        return 'En Cours';
      case 'terminer':
        return 'Terminé';
      default:
        return status; // Retourne le statut original si non reconnu
    }
  }

  toggleSelectAll(): void {
    this.allSelected = !this.allSelected;
    this.getReservationsForCurrentPage().forEach((reservation) => {
      reservation.selected = this.allSelected;
      if (this.allSelected) {
        this.selectedReservations.add(reservation.id);
      } else {
        this.selectedReservations.delete(reservation.id);
      }
    });
    this.updateClientReferenceId();
    this.logSelectedIds();
    this.updateOperationItems(); // Update the operation items based on the selection
  }

  logSelectedIds() {
    this.selectedIds = Array.from(this.selectedReservations);
  }

  updateClientReferenceId() {
    const currentPageReservations = this.getReservationsForCurrentPage();
    if (this.selectedReservations.size === 0) {
      this.clientReferenceId = null;
    } else if (this.selectedReservations.size === currentPageReservations.length) {
      this.clientReferenceId = currentPageReservations[0].utilisateur?.id;
    }
  }

  // Méthode pour obtenir les réservations de la page actuelle
  getReservationsForCurrentPage(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.reservations.slice(startIndex, endIndex);
  }

  setupOperationItems(): void {
    this.userType = this._estimationService.getUserType();
    this.updateOperationItems();
  }

  updateOperationItems(): void {
    const selectAllItem: MenuItem = {
      label: this.allSelected ? 'Tout désélectionner' : 'Tout sélectionner',
      command: () => this.toggleSelectAll()
    };

    if (this.userType === 'administrateur') {
      this.items = this.allSelected
        ? [
          selectAllItem,
          { label: 'Archivé les courses', command: () => this.archiverReservation() }
        ]
        : [
          selectAllItem,
          { label: 'Creer Une Facture', command: () => this.genererFacture() },
          { label: 'Ajouter Des Courses', command: () => this.router.navigate(['/app/reservations/reserver']) },
          { label: 'Charger via Excel', command: () => this.showDialog('visible') },
          { label: 'Archivé les courses', command: () => this.archiverReservation() }
        ];
    } else if (this.userType === 'client') {
      this.items = [
        selectAllItem,
        { label: 'Demander facture', command: () => this.demanderFacture() },
        { label: 'Nouvelle réservation', command: () => this.router.navigate(['/app/reservations/reserverSc']) },
      ];
    } else {
      this.items = [selectAllItem]; // Aucun item pour les autres types d'utilisateurs
    }
  }

  onCheckboxChange(
    reservationId: number,
    clientId: number,
    event: CheckboxChangeEvent
  ): void {
    const isChecked = event.checked;

    if (isChecked) {
      // Si aucune réservation n'a été encore sélectionnée, ou si le client correspond à la référence
      if (!this.clientReferenceId || this.clientReferenceId === clientId) {
        this.selectedReservations.add(reservationId);
        this.clientReferenceId = clientId; // Mise à jour du client de référence
      } else {
        this.message = "Toutes les réservations sélectionnées doivent appartenir au même client.";
        this.showError(this.message);
        // Rechercher la réservation et décocher
        this.getReservationsForCurrentPage().find(res => res.id === reservationId).selected = false;
      }
    } else {
      this.selectedReservations.delete(reservationId);
      // Réinitialiser clientReferenceId si plus aucune sélection
      if (this.selectedReservations.size === 0) {
        this.clientReferenceId = null;
      }
    }
    // Mettre à jour allSelected
    this.allSelected = this.getReservationsForCurrentPage().every(
      (reservation) => reservation.selected
    );

    this.logSelectedIds();
  }

  // Ouvrir le modal de confirmation
  exportToExcel() {
    this._reservationService.exportToExcel().subscribe((response: any) => {
      const blob = new Blob([response.body], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "reservations.xlsx";
      downloadLink.click();
    });
  }

  onFileSelect(event: any): void {
    this.selectedFile = event.files[0]; // PrimeNG's p-fileUpload stores selected files in `files`
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.errorMessage = "Veuillez sélectionner un fichier excel.";
      this.showError(this.errorMessage);
      return;
    }

    this.loading = true;
    this.visible = false
    setTimeout(() => {
      this._estimationService.importReservations(this.selectedFile!).subscribe(
        (response) => {
          this.loading = false;
          this.successMessage = "Les réservations ont été importées avec succès.";
          this.showSuccess(this.successMessage);
        },
        (error) => {
          console.error("Upload error:", error);
          this.loading = false;
          this.errorMessage = "Une erreur est survenue lors de l'importation des réservations.";
          this.showError(this.errorMessage);
        }
      );
    }, 2000);
  }

  demanderFacture() {
    const selectedIds = Array.from(this.selectedReservations);

    this.loading = true;
    setTimeout(() => {
      if (selectedIds.length === 0) {
        this.loading = false;
        this.message = "Veuillez sélectionner au moins une réservation.";
        this.showError(this.message);
        return;
      }

      this._estimationService.demanderFacture({ reservation_ids: selectedIds }).subscribe(
        (response) => {
          console.log('Demande de facturation réussie', response);
          this.loading = false;
          this.successMessage = 'Demande de facturation envoyée avec succès.';
          this.showSuccess(this.successMessage);
        },
        (error) => {
          this.loading = false;
          console.error('Erreur lors de la demande de facturation', error);
          this.errorMessage = 'Erreur lors de la demande de facturation.';
          this.showError(this.errorMessage);
        }
      );
    }, 2000);
  }

  getInputType(): string {
    switch (this.selectedFilterKey) {
      case "datePriseEnCharge":
        return "date";
      case "coutTransport":
      case "nombrePassager":
      case "distance":
      case "coutTotalReservation":
        return "number";
      default:
        return "text";
    }
  }

  getReservationsFiltre(page: number = 1, rows: number = 20): void {
    if (this.selectedFilterKey && this.filterValue) {
      const filterParams = {
        [this.selectedFilterKey]: this.filterValue,
      };

      this._estimationService.getReservationsFiltre(filterParams, page, rows).subscribe(
        (response: any) => {
          this.reservations = response.results.map((reservation: any) => {
            // Ajout des menuItems à chaque réservation
            reservation.menuItems = this.getMenuItems(reservation);
            return reservation;
          });
          this.reservations = response.results; // Assurez-vous que 'results' est bien la clé dans la réponse paginée
          this.currentPage = page;
          this.totalPages = Math.ceil(response.count / rows); // Mettez à jour le nombre total de pages
        },
        (error) => {
          console.error("Error fetching filtered reservations", error);
        }
      );
    }
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first || 0;
    this.rows = event.rows || 10;
    const page = (event.page !== undefined ? event.page : this.first / this.rows) + 1; // PrimeNG pages are 0-based, your API is 1-based

    if (this.filterValue) {
      // Si un filtre est appliqué, appeler la méthode de filtrage avec pagination
      this.getReservationsFiltre(page, this.rows);
    } else {
      // Sinon, récupérer les réservations normales avec pagination
      this.getReservations(page, this.currentReservationType);
    }
  }

  getReservations(page: number, reservationType: string): void {
    this._reservationService.getReservations(page, reservationType).subscribe((data: any) => {

      this.reservations = data.results.map((reservation: any) => {
        // Ajout des menuItems à chaque réservation
        reservation.menuItems = this.getMenuItems(reservation);
        return reservation;
      });
      this.currentPage = page;
      this.totalPages = Math.ceil(data.count / this.rows); // Calcul dynamique du nombre de pages
    });
  }

  getMenuItems(reservation: any): MenuItem[] {
    const userType = this._estimationService.getUserType();
    const availabilityItems = [
      { label: 'À Un chauffeur Interne', icon: 'pi pi-fw pi-user', command: () => this.choisirAction('interne', reservation) },
      { label: 'À Un chauffeur Externe', icon: 'pi pi-fw pi-users', command: () => this.choisirAction('externe', reservation) }
    ];

    if (userType === 'administrateur') {
      return [
        {
          label: 'Actions sur la course', icon: 'pi pi-fw pi-cog', items: [
            { label: 'Creer La Course Retour', icon: 'pi pi-fw pi-plus', command: () => this.chargerEtPreparerCourseRetour(reservation.id, 'retour') },
            { label: 'Dupliquer La Course', icon: 'pi pi-fw pi-copy', command: () => this.chargerEtPreparerDuplication(reservation.id, 'dupliquer') },
            { label: 'Répéter La Course', icon: 'pi pi-fw pi-refresh', command: () => this.openRepetitionModal(reservation.id, 'repeter') }
          ]
        },
        {
          label: 'Demande de disponibilité', icon: 'pi pi-fw pi-calendar', items: [
            ...availabilityItems,
            { label: 'À Une Entreprise Partenaire', icon: 'pi pi-fw pi-building', command: () => this.choisirAction('partenaire', reservation) }
          ]
        }
      ];
    }

    if (userType === 'partenaire') {
      return [{ label: 'Demande de disponibilité', icon: 'pi pi-fw pi-calendar', items: availabilityItems }];
    }

    return [];
  }


  confirmPropagation(event: Event, id: any) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Voulez-vous restaurer toutes les réservations associées a cette reservation reccurente?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.manageReservation('restaurer', id, true)
      },
      reject: () => {
        this.manageReservation('restaurer', id, false)
      }
    });
  }

  showDialog(type: 'retour' | 'dupliquer' | 'repeter' | 'visible' | 'custom' | 'content') {
    switch (type) {
      case 'retour':
        this.isCourseRetourVisible = true;
        break;
      case 'dupliquer':
        this.isCourseDuppliquerVisible = true;
        break;
      case 'visible':
        this.visible = true;
        break;
      case 'custom':
        this.isCustom = true;
        break;
      case 'content':
        this.isContent = true;
        break;
      case 'repeter':
        this.isCourseReppeterVisible = true;
        break;
    }
  }

  // Méthode pour charger une réservation et ouvrir le modal pour la course retour
  chargerEtPreparerCourseRetour(reservationId: any, type: any) {
    this._estimationService.getReservation(reservationId).subscribe((data) => {
      // Vérifier les données récupérées de l'API
      const { lieuxPriseEnCharge, lieuxDestination, coutTotalReservation } = data;
      // Inversion des adresses et mise à jour des valeurs du formulaire
      this.courseRetourForm.patchValue({
        id: reservationId,
        depart: lieuxDestination,
        arrive: lieuxPriseEnCharge,
        coutTotalReservation: coutTotalReservation,
      });

      this.showDialog(type);
    });
  }

  creerReservationRetour(): void {
    if (this.courseRetourForm.invalid) {
      return;
    }

    // Get the combined date and time without applying a timezone
    const date = this.courseRetourForm.get('datePriseEnChargeDate')?.value;
    const time = new Date(this.courseRetourForm.get('datePriseEnChargeTime')?.value).toLocaleTimeString('en-GB', { hour12: false });
    const combinedDateTimeString = `${date}T${time}`; // Combine date and time without timezone

    const id = this.courseRetourForm.get('id')?.value;
    const coutTotalReservation = this.courseRetourForm.get('coutTotalReservation')?.value;
    const lieuRendezVous = this.courseRetourForm.get('lieu_rendez_vous')?.value;  // Get 'lieu_rendez_vous' from the form

    // Call the service to create the return reservation
    this.loading = true;
    this.isCourseRetourVisible = false;
    setTimeout(() => {
      this._reservationService.creerCourseRetour(id, combinedDateTimeString, coutTotalReservation, lieuRendezVous).subscribe(
        response => {
          this.loading = false;
          this.successMessage = "Course retour enregistrée avec succès.";
          this.showSuccess(this.successMessage);
          this.router.navigate(['/app/reservations']);
        },
        error => {
          console.error("Error during reservation:", error);
          this.errorMessage = 'Erreur lors de la création de la course retour';
          this.loading = false;
          this.showError(this.errorMessage);
        }
      );
    }, 2000);
  }

  // Méthode pour charger et préparer la duplication d'une réservation
  chargerEtPreparerDuplication(reservationId: any, type: any) {
    this._estimationService.getReservation(reservationId).subscribe((data) => {
      // Initialisation des dates et autres données
      const dateTime = new Date(data.datePriseEnCharge);
      const datePart = dateTime.toISOString().substring(0, 10); // 'YYYY-MM-DD'
      const timePart = dateTime.toISOString().substring(11, 16); // 'HH:MM'

      // Destructuration des données
      const { attribut, notes, vehicule, utilisateur, nombreBagage, ...rest } = data;

      // Mise à jour du formulaire
      this.reserverForm.patchValue({
        datePriseEnChargeDate: datePart,
        datePriseEnChargeTime: timePart,
        vehicule: vehicule?.id || null,
        utilisateur: utilisateur?.id || null, // Assurez-vous d'attribuer l'ID du client
        nbre: nombreBagage ? parseInt(nombreBagage.split(' ')[0]) : null, // Nombre de bagages
        ...rest,
      });

      // Traitement des attributs
      if (attribut && attribut.length > 0) {
        const attributFormArray = this.reserverForm.get("attribut") as FormArray;
        attributFormArray.clear();
        attribut.forEach((attr: any) => {
          attributFormArray.push(this.fb.group({
            quantite: attr.quantite,
            nom_attribut: attr.nom_attribut,
            nombre_maximum: attr.nombre_maximum,
            prix_unitaire_attribut: attr.prix_unitaire_attribut,
          }));
        });
      }

      // Traitement des passagers et notes
      const passengersFormArray = this.reserverForm.get("passengers") as FormArray;
      passengersFormArray.clear();

      if (notes && notes.length > 0) {
        notes.forEach((note: any) => {
          if (note.type === 'passenger') {
            const content = note.content;
            const match = content.match(/nom:\s*(.+),\s*numero:\s*(.+)/);
            if (match) {
              const name = match[1].trim();
              const phone = match[2].trim();
              passengersFormArray.push(this.fb.group({
                name: name,
                phone: phone
              }));
            }
          } else if (note.type === 'note') {
            this.reserverForm.patchValue({ note: note.content });
          }
        });
      }

      // Utiliser les informations du véhicule
      if (vehicule) {
        this.vehiculeData = vehicule;
        this.updateVehiculeNameInput(`${vehicule.marque} ${vehicule.modele} (${vehicule.typeVehicule})`);

        const capaciteChargementParts = vehicule.capacite_chargement.split(' ');
        if (capaciteChargementParts.length === 2) {
          this.capaciteChargement = capaciteChargementParts[0];
          this.type_bagages = this.formatTypeBagages(capaciteChargementParts[1]);
        }
      }

      this.loadPaymentMethods();
      this.getClient();

      // Ouvre le modal avec le formulaire pré-rempli
      this.showDialog(type);
    });
  }

  // Méthode pour créer la réservation dupliquée
  dupliquer(): void {
    if (this.reserverForm.valid) {
      this.combineBagageFields();
      // Étape 1: Extraire les valeurs des dropdowns
      const formValue = this.reserverForm.getRawValue();

      // Mise à jour des champs avec uniquement les valeurs nécessaires
      this.reserverForm.patchValue({
        utilisateur: formValue.utilisateur.value || formValue.utilisateur,
        modePaiement: formValue.modePaiement.value || formValue.modePaiement,
        nbre: formValue.nbre.value || formValue.nbre,
        nombrePassager: formValue.nombrePassager.value || formValue.nombrePassager,
      });

      // Étape 2: Manipulation correcte de la date et de l'heure
      const date = this.reserverForm.get('datePriseEnChargeDate')?.value;
      const timeControl = this.reserverForm.get('datePriseEnChargeTime')?.value;
      let time: string;
      let combinedDateTimeString

      if (typeof timeControl === 'string') {
        time = timeControl;
        combinedDateTimeString = `${date}T${time}:00`;

      } else {
        time = new Date(timeControl).toLocaleTimeString('en-GB', { hour12: false });
        combinedDateTimeString = `${date}T${time}`;

      }

      this.reserverForm.patchValue({
        datePriseEnCharge: combinedDateTimeString,
      });

      // Étape 3: Reconstituer le tableau 'notes' avec les données des passagers et des notes
      const notesArray = formValue.passengers.map((p: { name: string; phone: string }) => ({
        type: 'passenger',
        content: `nom: ${p.name}, numero: ${p.phone}`
      }));

      if (formValue.note) {
        notesArray.push({ type: 'note', content: formValue.note });
      }

      // Mise à jour du champ 'notes' dans le FormGroup avec le tableau complet
      this.reserverForm.setControl('notes', this.fb.array(notesArray));

      // Générer un nouveau numéro de réservation
      const injectData = {
        lieuxPriseEnCharge: formValue.lieuxPriseEnCharge,
        lieuxDestination: formValue.lieuxDestination,
        nombrePassager: formValue.nombrePassager.value || formValue.nombrePassager,
        nbre: formValue.nbre.value || formValue.nbre,
        utilisateur: formValue.utilisateur.value || formValue.utilisateur
      };
      const newNumeroReservation = this.genererNumeroReservation(injectData);
      this.reserverForm.patchValue({
        numero_reservation: newNumeroReservation,
      });

      console.log('formValue', this.reserverForm.value)
      // Soumission des données au serveur
      this.loading = true;
      this.isCourseDuppliquerVisible = false;
      this._estimationService.addReservation(this.reserverForm.getRawValue()).subscribe(
        () => {
          setTimeout(() => {
            this.loading = false;
            this.successMessage = "Duplication de la course enregistrée avec succès.";
            this.showSuccess(this.successMessage);
            this.reserverForm.reset(); // Réinitialisation du formulaire
            this.router.navigate(['/app/reservations']);
          }, 1000);

        },
        (error) => {
          this.errorMessage = "Erreur lors de la duplication de la course";
          console.error(error);
          this.loading = false;
          this.showError(this.errorMessage);
        }
      );
    }
  }

  getClient() {
    this._estimationService.getClients().subscribe((data) => {
      // Mapper les clients pour créer une structure avec label et value
      this.clients = data.clients.map((client: { id: any; }) => ({
        label: this.formatClientLabel(client),
        value: client.id
      }));
    });
  }

  formatClientLabel(client: any): string {
    if (client.type_client === 'client_simple') {
      return `${client.last_name} ${client.first_name} (Client Simple)`;
    } else if (client.type_client === 'client_liee_societe') {
      return `${client.last_name} ${client.first_name} (liée à ${client.societe.nom})`;
    } else if (client.type_client === 'client_liee_agence') {
      return `${client.last_name} ${client.first_name} (liée à ${client.agence.nom})`;
    } else if (client.type_client === 'client_agence') {
      return `${client.last_name} (Agence)`;
    } else if (client.type_client === 'client_societe') {
      return `${client.last_name} (Société)`;
    }
    return `${client.last_name} ${client.first_name}`;
  }

  loadPaymentMethods(): void {
    this._estimationService.getAllMethodePayement().subscribe((data: Methode[]) => {
      this.paymentMethods = data
        .filter(methode => methode.is_active)
        .map(methode => ({
          value: methode.nom,  // Cette valeur sera utilisée pour formControlName
          label: this.formatPaymentMethodName(methode.nom),
        }));
    });
  }

  generateOptions(capacite: number | string): any[] {
    const options: any[] = [];
    const maxCapacite = typeof capacite === 'number' ? capacite : parseInt(capacite, 10);

    for (let i = 1; i <= maxCapacite; i++) {
      options.push({ label: `${i}`, value: i });
    }

    return options;
  }

  // Méthode pour combiner les champs liés aux bagages
  combineBagageFields(): void {
    const nbreValue = this.reserverForm.get('nbre')?.value.value || this.reserverForm.get('nbre')?.value;
    const nombreBagageFormatted = `${nbreValue} ${this.type_bagages}`;
    this.reserverForm.patchValue({
      nombreBagage: nombreBagageFormatted.length <= 20 ? nombreBagageFormatted : nombreBagageFormatted.substring(0, 20)
    });
  }

  // Méthode pour formater le type de bagages
  formatTypeBagages(type: string): string {
    switch (type) {
      case 'Cabine': return 'Bagage cabine';
      case 'M': return 'Valise moyenne';
      case 'L': return 'Valise large';
      case 'XL': return 'Valise extra-large';
      default: return type;
    }
  }

  submitForm(): void {
    if (this.eventForm.valid) {
      const formData = this.eventForm.getRawValue();

      let rrule;
      let end_recurring_period;

      if (formData.regleRepetition === "custom") {
        // Récupération des données du formulaire de récurrence personnalisé
        const form = this.customRecurrenceForm.getRawValue();
        rrule = this.generateCustomRrule(form);

        // Définit end_recurring_period à null si 'ends' est 'never' ou si 'occurrences' est activé
        if (
          form.ends === "never" ||
          !this.customRecurrenceForm.get("occurrences")?.disabled
        ) {
          end_recurring_period = null;
        } else {
          // Sinon, utilisez endDate si elle est définie
          end_recurring_period = form.endDate
            ? new Date(form.endDate).toISOString()
            : null;
        }
      } else {
        // Générer une règle standard
        rrule = this.generateRrule(formData);
        end_recurring_period = formData.end_recurring_period
          ? formData.end_recurring_period
          : null;
      }

      // Mise à jour de la règle de répétition dans eventForm
      this.eventForm.patchValue({
        regle_repetition: rrule,
        end_recurring_period: end_recurring_period,
      });

      const data = {
        reservation_id: this.reservationId,
        regle_repetition: rrule,
        end_recurring_period: end_recurring_period,
        exclude_dates: formData.exclude_dates ? formData.exclude_dates : [],
      };

      this.loading = true;
      this.isCourseReppeterVisible = false
      setTimeout(() => {
        // Appel au service pour créer la réservation récurrente
        this._reservationService.creerReservationRecurrente(data).subscribe({
          next: (response) => {
            this.loading = false;
            this.successMessage = "Réservation récurrente créée avec succès";
            this.showSuccess(this.successMessage);
            this.router.navigate(['/app/reservations']);

          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = "Erreur lors de la création de la réservation récurrente:";
            this.showError(this.errorMessage);
            console.error(error)
          },
        });
      }, 1000);
    }
  }

  private generateRrule(formData: any): string {
    const count = formData.nombreOccurrences + 1;
    const freq = formData.regleRepetition;
    const date = this.date;
    const weekDayIndex = date.getDay();
    const weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    const day = weekDays[weekDayIndex];

    let rrule = `FREQ=${freq.toUpperCase()};COUNT=${count}`;
    if (freq === "weekly") {
      rrule += `;BYDAY=${day}`;
    } else if (freq === "monthly") {
      rrule += `;BYDAY=2${day}`;
    } else if (freq === "annually") {
      const month = date.getMonth() + 1; // Months are 0-indexed in JavaScript
      const monthDay = date.getDate();
      rrule += `;BYMONTHDAY=${monthDay};BYMONTH=${month}`;
    } else if (freq === "weekday") {
      rrule += ";BYDAY=MO,TU,WE,TH,FR";
    }
    return rrule;
  }

  submitCustomRecurrence() {
    if (this.customRecurrenceForm.valid) {
      const formData = this.customRecurrenceForm.getRawValue();
      const rule = this.generateCustomRrule(formData);
      console.log(rule);
    }
  }

  private generateCustomRrule(data: any): string {
    const { repeatEvery, repeatType, ends, endDate } = data;
    const occurrences = data.occurrences + 1; // Ajout de +1 à occurrences

    // Assurez-vous que repeatType est un membre de l'enum Frequency
    const frequency = Frequency[repeatType as keyof typeof Frequency];
    if (!frequency) {
      throw new Error("Invalid repeat type");
    }

    let rrule = `FREQ=${frequency};INTERVAL=${repeatEvery}`;
    switch (ends) {
      case "never":
        break;
      case "on":
        rrule += `;UNTIL=${this.formatDateForRrule(new Date(endDate))}`;
        break;
      case "after":
        rrule += `;COUNT=${occurrences}`;
        break;
    }
    return rrule;
  }

  private formatDateForRrule(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // Month from 0 to 11
    const day = date.getUTCDate();
    return `${year}${month.toString().padStart(2, "0")}${day
      .toString()
      .padStart(2, "0")}T000000Z`;
  }

  manageReservation(action: string, reservationId: number, propager: boolean): void {
    this.loading = true;
    setTimeout(() => {
      this._reservationService.manageReservation(action, reservationId, propager).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loading = false;
          this.showSuccess(this.successMessage);
          this.router.navigate(['/app/reservations'])
        },
        error: (e) => {
          console.error(e);
          this.loading = false;
          this.errorMessage = "Une erreur est survenu lors de l'action sur la reservation";
          this.showError(this.errorMessage)
        },
      });
    }, 1000);
  }

  archiverReservation(): void {
    this.loading = true;
    setTimeout(() => {
      if (this.selectedReservations.size > 0) {
        const selectedIdsArray = Array.from(this.selectedReservations);

        this._reservationService.archiverReservation(selectedIdsArray).subscribe(
          (data) => {
            this.loading = false;
            this.successMessage = "Reservation archivée avec succès";
            this.showSuccess(this.successMessage);
          },
          (error) => {
            console.error(error);
            this.loading = false;
            this.errorMessage = "Une erreur est survenue. Veuillez réessayer plus tard.";
            this.showError(this.errorMessage);
          }
        );
      } else {
        this.loading = false;

        this.errorMessage = "Veuillez sélectionner au moins une réservation.";
        this.showError(this.errorMessage);
      }
    }, 2000);
  }

  openRepetitionModal(reservation: any, type: any): void {

    this._estimationService.getReservation(reservation).subscribe((data) => {

      const date = new Date(data.datePriseEnCharge);
      this.date = new Date(data.datePriseEnCharge);
      this.reservationId = data.id;
      const weekDayIndex = date.getDay();
      const weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
      const frenchWeekDays = [
        "dimanche",
        "lundi",
        "mardi",
        "mercredi",
        "jeudi",
        "vendredi",
        "samedi",
      ];

      this.weekDayLabel = `Hebdomadaire le ${frenchWeekDays[weekDayIndex]}`;
      this.monthlyLabel = `Mensuel le deuxième ${frenchWeekDays[weekDayIndex]}`;
      this.annualLabel = `Annuellement chaque ${date.getDate()} ${date.toLocaleString(
        "fr-FR",
        { month: "long" }
      )}`;

      this.eventForm.patchValue({
        datePriseEnCharge: date.toLocaleDateString(),
        heurePriseEnCharge: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        regleRepetition: "daily", // Ensure daily is selected by default
      });
      // Ouvre le modal avec le formulaire pré-rempli
      this.initializeRepetitionOptions()
      this.showDialog(type);
    });
  }

  initializeRepetitionOptions() {
    this.repetitionOptions = [
      { label: 'Quotidien', value: 'daily' },
      { label: this.weekDayLabel, value: 'weekly' },
      { label: this.monthlyLabel, value: 'monthly' },
      { label: this.annualLabel, value: 'annually' },
      { label: 'Chaque jour de la semaine (lundi au vendredi)', value: 'weekday' },
      { label: 'Personnalisé...', value: 'custom' },
    ];
  }

  repeatTypeOptions: { label: string, value: string }[] = [
    { label: 'Jour', value: 'day' },
    { label: 'Semaine', value: 'week' },
    { label: 'Mois', value: 'month' },
    { label: 'Année', value: 'year' },
  ];

  handleRepetitionChange(event: any) {
    if (event && event.value) {
      const selectedValue = event.value;
      if (selectedValue === "custom") {
        this.showDialog("custom");
      }
    }
  }


  onSubmit(): void {
    if (this.form.valid) {
      let utilisateurValue = this.form.get('utilisateur_id')?.value;

      if (utilisateurValue && typeof utilisateurValue === 'object') {
        utilisateurValue = utilisateurValue.value; // Extraire la partie 'value'
      }

      // Si ChauffeurExterne est sélectionné, ignorer utilisateur_id
      if (this.ChauffeurExterne) {
        utilisateurValue = null;
      }

      // Mettre à jour le formulaire avec la valeur extraite
      this.form.patchValue({
        utilisateur_id: utilisateurValue
      });

      const { reservationId, email, chauffeurExterneNom, chauffeurExterneNumero, utilisateur_id } = this.form.value;

      if (!email && !utilisateur_id) {
        this.errorMessage = "Aucun identifiant d'utilisateur ou email fourni.";
        this.showError(this.errorMessage);
        return;
      }

      const dataChauffeurExterne = email ? { nom: chauffeurExterneNom, telephone: chauffeurExterneNumero } : null;

      // Créer l'objet de données à envoyer
      const data = {
        ...this.form.value,
        dataChauffeurExterne,
      };

      this.loading = true;
      this.isContent = false;
      setTimeout(() => {
        const actionObservable = this.afficherDirect
          ? this._estimationService.affecterCourseDirectement(reservationId, data)
          : this._estimationService.envoyerEmailReservation(reservationId, data);

        actionObservable.subscribe({
          next: (response) => {
            this.loading = false;
            this.successMessage = response.message;
            this.showSuccess(this.successMessage);
            this.form.reset();
          },
          error: (error) => {
            this.loading = false;
            console.error(error);
            this.errorMessage = error.message;
            this.showError(this.errorMessage);
          }
        });
      }, 1000);
    } else {
      this.errorMessage = "Le formulaire est invalide.";
      this.showError(this.errorMessage);
    }
  }


  choisirAction(action: string, reservation: any) {
    // Réinitialiser les états des actions
    this.afficherChauffeurInterne = false;
    this.afficherChauffeurExterne = false;
    this.afficherEntreprisePartenaire = false;
    this.afficherDirect = false;

    this.data = reservation;

    this.form.patchValue({
      reservationId: reservation.id, // Utilisez patchValue pour pré-remplir uniquement ce champ
    });
    this.cout = reservation.coutTotalReservation;
    // Définir l'action choisie
    if (action === "interne") {
      this.afficherChauffeurInterne = true;
    } else if (action === "externe") {
      this.afficherChauffeurExterne = true;
    } else if (action === "partenaire") {
      this.afficherEntreprisePartenaire = true;
    } else if (action === "direct") {
      this.afficherDirect = true;
    }
    // Afficher le modal
    this.showDialog('content');
    this.updateDialogHeader();

  }
  dialogHeader: string = '';


  updateDialogHeader() {
    if (this.afficherChauffeurInterne) {
      this.dialogHeader = 'Demande de disponibilité d\'un Chauffeur Interne';
    } else if (this.afficherChauffeurExterne) {
      this.dialogHeader = 'Demande de disponibilité d\'un Chauffeur Externe';
    } else if (this.afficherEntreprisePartenaire) {
      this.dialogHeader = 'Demande de disponibilité d\'une Entreprise Partenaire';
    } else if (this.afficherDirect) {
      this.dialogHeader = 'Affectation Direct';
    } else {
      this.dialogHeader = ''; // ou une valeur par défaut si nécessaire
    }
  }

  chauffeursOptions: { label: string; value: any }[] = [];
  entreprisePartenaireOptions: { label: string; value: any }[] = [];

  getChauffeursOptions() {
    this.chauffeursOptions = this.chauffeurs.map((chauffeur: { last_name: any; first_name: any; personne_ptr: any; }) => ({
      label: `${chauffeur.last_name} ${chauffeur.first_name}`,
      value: chauffeur.personne_ptr
    }));
  }

  getEntreprisePartenaireOptions() {
    this.entreprisePartenaireOptions = this.entreprisePartenaire.map((partenaire: { nom: any; partenaire: { personne_ptr: any; }; }) => ({
      label: partenaire.nom,
      value: partenaire.partenaire.personne_ptr
    }));
  }

  getChauffeur(entrepriseType: string): void {
    const userType = this._estimationService.getUserType();

    this._estimationService.getChauffeurs().subscribe((data) => {
      this.chauffeurs = data.filter((chauffeur) => {
        if (userType === 'partenaire') {
          return chauffeur.entreprise_affiliee === entrepriseType && chauffeur.validation === true;
        }
        return chauffeur.entreprise_affiliee === entrepriseType;
      });

      this.getChauffeursOptions();
    });
  }


  getEntreprise(): void {
    const userType = this._estimationService.getUserType();

    this._estimationService.getEntreprises().subscribe((data) => {
      if (userType === 'administrateur') {
        this.entrepriseList = data.filter((entreprise) => entreprise.type_entreprise === 'mon_entreprise');

        if (this.entrepriseList.length > 0) {
          for (const monEntreprise of this.entrepriseList) {
            this.getChauffeur(monEntreprise.id);
          }
        }
      } else if (userType === 'partenaire') {
        this.entrepriseList = data.filter((entreprise) => entreprise.type_entreprise === 'entreprise_partenaire');
        console.log('Company list:', this.entrepriseList);

        if (this.entrepriseList.length > 0) {
          const userSpecificId = this._estimationService.getSpecificId();
          console.log('User specific ID:', userSpecificId);

          // Conversion des types pour s'assurer qu'ils correspondent
          const matchedCompany = this.entrepriseList.find((entreprise: { partenaire: any; }) => entreprise.partenaire == userSpecificId); // Utilisation de '==' pour comparer les valeurs sans tenir compte des types

          if (matchedCompany) {
            console.log('Matched company for chauffeur retrieval:', matchedCompany);
            this.getChauffeur(matchedCompany.id);
          } else {
            console.log('No matching company found for the provided userSpecificId.');
          }
        }
      }
    });
  }


  getEntreprisePartenaire(): void {
    this._estimationService.getValideEntreprisesPartenaires().subscribe((data) => {
      this.entreprisePartenaire = data
      this.getEntreprisePartenaireOptions();
    });
  }


  setView(type: string) {
    this.ChauffeurInterne = type === "interne";
    this.ChauffeurExterne = type === "externe";
    this.EntreprisePartenaire = type === "partenaire";

    // Reset non-relevant form fields
    if (this.ChauffeurInterne || this.EntreprisePartenaire) {
      this.form.patchValue({
        email: null,
        chauffeurExterneNom: null,
        chauffeurExterneNumero: null
      });
      this.form.get('utilisateur_id')?.setValidators([Validators.required]);
      this.form.get('email')?.clearValidators();
      this.form.get('chauffeurExterneNom')?.clearValidators();
      this.form.get('chauffeurExterneNumero')?.clearValidators();
    } else if (this.ChauffeurExterne) {
      this.form.patchValue({
        utilisateur_id: null
      });
      this.form.get('utilisateur_id')?.clearValidators();
      this.form.get('email')?.setValidators([Validators.required, Validators.email]);
      this.form.get('chauffeurExterneNom')?.setValidators([Validators.required]);
      this.form.get('chauffeurExterneNumero')?.setValidators([Validators.required]);
    }

    // Update validators
    this.form.get('utilisateur_id')?.updateValueAndValidity();
    this.form.get('email')?.updateValueAndValidity();
    this.form.get('chauffeurExterneNom')?.updateValueAndValidity();
    this.form.get('chauffeurExterneNumero')?.updateValueAndValidity();
  }



  showRestoreDialog(reservation: any): void {
    this.restoreVisible = true;
    this.reservation = reservation
  }

  demanderRestaurationClient(): void {
    this.restoreVisible = false;
    this.loading = true;
    setTimeout(() => {
      this._reservationService.demanderRestauration({ reservation_id: this.reservation.id }).subscribe(
        (response) => {
          console.log('Demande de restauration réussie', response);
          this.loading = false;
          this.successMessage = 'Demande de restauration envoyée avec succès.';
          this.showSuccess(this.successMessage)
        },
        (error) => {
          this.loading = false;
          console.error('Erreur lors de la demande de restauration', error);
          this.errorMessage = 'Erreur lors de la demande d\'annulation.';
          this.showError(this.errorMessage)
        }
      );
    }, 1500);
  }

  Autocomplete() {
    const addressFields = [
      'lieu_rendez_vous'
    ];

    addressFields.forEach(field => {
      const addressInput = document.getElementById(field) as HTMLInputElement;
      if (addressInput) {
        const addressAutocomplete = new google.maps.places.Autocomplete(addressInput, {
          types: [],
        });
        addressAutocomplete.addListener('place_changed', () => {
          this.reserverForm.patchValue({ [field]: addressInput.value });
        });
      }
    });
  }

}
