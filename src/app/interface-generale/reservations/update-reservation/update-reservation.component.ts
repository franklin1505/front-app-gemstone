import { DatePipe, formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { WebsocketService } from '../../../utilitaires/services/websocket.service';
import { Methode } from '../../../utilitaires/models/parametres';

declare var google: any;


@Component({
  selector: 'app-update-reservation',
  templateUrl: './update-reservation.component.html',
  styleUrls: ['./update-reservation.component.css']
})

export class UpdateReservationComponent implements OnInit {
  paymentDropdownOptions: { label: string, value: string }[] = [];

  type_bagages: any;
  capaciteChargement: any;
  reservationId: any;
  reserverForm: FormGroup;
  clientD: any;
  vehiculesDisponibles: any[] = [];
  isVehiculeEdit: boolean = false;
  vehiculeData: any;
  estimations: any;
  vehicules: any[] = [];
  originalDatePriseEnCharge!: any;
  originalUtilisateur: any;
  originalVehicule: any;
  isNombrePassagerEdit: boolean = false;
  isLieuxDestinationEdit: boolean = false;
  isLieuxPriseEnChargeEdit: boolean = false;
  isNombreBagageEdit: boolean = false;
  isModePaiementEdit: boolean = false;
  isCompagnieAerienneEdit: boolean = false;
  isNumeroDossierEdit: boolean = false;
  isCoutTransportEdit: boolean = false;
  isCoutMajorerEdit: boolean = false;
  originalCoutMajorer: number = 0;
  originalCoutTransport: number = 0;
  isTotalAttributCostEdit: boolean = false;
  originalAttributCost: number = 0;
  originalCoutTotalReservation: number = 0;
  originalCompagnieAerienne: string = '';
  originalNumeroDossier: string = '';
  isNoteEdit: boolean = false;
  originalNote: string = '';
  successMessage = '';
  errorMessage = '';
  loading: boolean = false;
  isVehiculeModified = false;
  preRemplissageActif: boolean = false;
  originalLieuxDestination = '';
  originalNombrePassager = '';
  originalNombreBagages = '';
  originalModePaiement = '';
  originalLieuxPriseEnCharge = '';
  isDatePriseEnChargeEdit: boolean = false;
  reservation: any;
  isPassengerEdit: boolean[] = [];

  breadcrumbItems: MenuItem[] = [];
  display: boolean = false;
  isValidation: boolean = false;
  contentManage: boolean = false;
  isAddingPassenger = false;
  newPassengerForm: FormGroup;
  @ViewChild('lieuxPriseEnChargeInput', { static: false }) lieuxPriseEnChargeInput!: ElementRef<HTMLInputElement>;
  @ViewChild('lieuxDestinationInput', { static: false }) lieuxDestinationInput!: ElementRef<HTMLInputElement>;

  ngAfterViewInit() {
    this.initAutocomplete();
  }

  constructor(
    private fb: FormBuilder,
    private _estimationService: CrmService,
    private _reservationService: CrmService,
    private messageService: MessageService,
    private websocketService: WebsocketService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private http: HttpClient,
    private router: Router
  ) {
    this.reserverForm = this.fb.group({
      numero_reservation: [''],
      utilisateur: [''],
      datePriseEnCharge: [''],
      dateRetour: [''],
      coutTransport: 0,
      coutMajorer: 0,
      lieuxPriseEnCharge: [''],
      lieuxDestination: [''],
      distance: [''],
      duree: [''],
      typeReservation: [''],
      vehicule: [null],
      vehiculeView: [null],
      distanceWaypoint: [null],
      dureeWaypoint: [null],
      destinationInputs: this.fb.array([]),
      coutTotalReservation: 0,
      totalAttributCost: 0,
      attribut: this.fb.array([]),
      nombreBagage: [''],
      nombrePassager: [''],
      compagnieAerienne: [''],
      modePaiement: [''],
      statutReservation: [''],
      datePriseEnChargeDate: [''],
      datePriseEnChargeTime: [''],
      numero_dossier: [''],
      nbre: [''],
      notes: this.fb.array([]),
      passengers: this.fb.array([]),
      note: [''],
    });
    this.newPassengerForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
    });
  }
  // Liste des méthodes de paiement disponibles
  paymentMethods = [
    { label: 'Paiement par PayPal', nom: 'payement_paypal' },
    { label: 'Paiement par Stripe', nom: 'payement_stripe' },
    { label: 'Paiement à bord (espèce ou CB)', nom: 'payement_abord' },
    { label: 'Paiement par virement bancaire', nom: 'payement_virement' },
    { label: 'Paiement en compte', nom: 'payment_en_compte' }
  ];

  ngOnInit(): void {
    this.breadcrumbItems = [
      { label: 'Reservations' },
      { label: 'Mise a jour' }
    ];

    this.reservationId = this.route.snapshot.paramMap.get('id');
    this.getReservation()
  }

  getReservation() {
    if (this.reservationId) {
      this._estimationService.getReservation(this.reservationId).subscribe((data) => {
        this.reservation = data;
        console.log(this.reservation);

        // Store original date and other properties as received
        this.originalDatePriseEnCharge = data.datePriseEnCharge;
        this.originalUtilisateur = data.utilisateur.id;
        this.originalVehicule = data.vehicule.id;
        this.originalCoutMajorer = data.coutMajorer;
        this.originalCoutTransport = data.coutTransport;
        this.originalCoutTotalReservation = data.coutTotalReservation;
        this.originalAttributCost = data.totalAttributCost;
        this.originalLieuxDestination = data.lieuxDestination;
        this.originalLieuxPriseEnCharge = data.lieuxPriseEnCharge;
        this.originalNombrePassager = data.nombrePassager;
        this.originalNombreBagages = data.nombreBagage;
        this.originalModePaiement = data.modePaiement;

        // Directly patch the date and time fields without any conversion
        if (data.datePriseEnCharge) {
          const dateTime = new Date(data.datePriseEnCharge);
          const formattedDateTime = this.datePipe.transform(dateTime, 'dd MMM yyyy à HH:mm');
          this.reserverForm.patchValue({
            datePriseEnCharge: formattedDateTime,  // This will be displayed in the input
            datePriseEnChargeDate: dateTime,
            datePriseEnChargeTime: dateTime
          });
        }

        const { notes, attribut, ...formData } = data;
        this.reserverForm.patchValue(formData);

        // Clear and load 'attribut' FormArray
        const attributFormArray = this.reserverForm.get('attribut') as FormArray;
        attributFormArray.clear();
        if (attribut && attribut.length > 0) {
          attribut.forEach((attr: any) => {
            attributFormArray.push(
              this.fb.group({
                quantite: attr.quantite,
                nom_attribut: attr.nom_attribut,
                nombre_maximum: attr.nombre_maximum,
                prix_unitaire_attribut: attr.prix_unitaire_attribut,
              })
            );
          });
        }

        // Clear and load 'passengers' FormArray
        const passengersFormArray = this.reserverForm.get('passengers') as FormArray;
        passengersFormArray.clear();
        console.log("Cleared passengers form array.");

        if (notes && notes.length > 0) {
          notes.forEach((note: any) => {
            if (note.type === 'passenger') {
              const content = note.content;
              const match = content.match(/nom:\s*(.+),\s*numero:\s*(.+)/);
              if (match) {
                passengersFormArray.push(this.fb.group({
                  name: match[1].trim(),
                  phone: match[2].trim()
                }));
                console.log(`Added passenger: ${match[1].trim()} - ${match[2].trim()}`);
              }
            } else if (note.type === 'note') {
              this.reserverForm.patchValue({ note: note.content });
            }
          });
          console.log(`Total passengers added: ${passengersFormArray.length}`);
        }

        // Load payment methods, estimation, and vehicle/client details
        this.loadPaymentMethods();
        this.calculateEstimation(0, data);
        this.getVehiculeAndClient(data.utilisateur, data.vehicule);
        this.disableAllFormControls(this.reserverForm);
      });
    }
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/reservations']);
  }

  loadPaymentMethods(): void {
    this._estimationService.getAllMethodePayement().subscribe((data: Methode[]) => {

      this.paymentMethods = data
        .filter(methode => methode.is_active)
        .map(methode => ({
          nom: methode.nom,
          label: this.formatPaymentMethodName(methode.nom),
          description: methode.description
        }));

      this.paymentDropdownOptions = this.paymentMethods.map(method => ({
        label: method.label,
        value: method.nom
      }));
    });
  }


  private formatPaymentMethodName(method: string): string {
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

  disableAllFormControls(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.disable();
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.disableAllFormControls(control);
      }
    });
  }


  get attributsFormArray(): FormArray {
    return this.reserverForm.get('attribut') as FormArray;
  }

  private formatNaiveDate(date: Date): string {
    // Convertit la date en une chaîne ISO sans fuseau horaire
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }


  preRemplissage(response: any): void {
    const { distParcourt, durParcourt, distanceWaypoint, dureeWaypoint, transport_estimates } = response;
    let selectedVehicule = transport_estimates.find(
      (ve: { vehicule: any }) => ve.vehicule === this.reserverForm.get('vehicule')?.getRawValue()
    );

    if (!selectedVehicule && transport_estimates.length > 0) {
      this.isVehiculeModified = true;
      selectedVehicule = transport_estimates[0];
    }

    if (selectedVehicule) {
      this.reserverForm.patchValue({
        distance: distParcourt,
        duree: durParcourt,
        distanceWaypoint: distanceWaypoint,
        dureeWaypoint: dureeWaypoint,
        typeReservation: selectedVehicule.transport_type,
        vehicule: selectedVehicule.vehicule,
        coutTransport: selectedVehicule.cout,
        coutMajorer: selectedVehicule.cout_majoration || 0,
        coutTotalReservation:
          parseFloat(this.reserverForm.get('totalAttributCost')?.getRawValue() || 0) +
          selectedVehicule.cout +
          (selectedVehicule.cout_majoration || 0),
      });
    }
  }

  reload() {
    location.reload();
  }

  calculateEstimation(attemptCount: number = 0, data: any): void {
    const formData = {
      datePriseEnCharge: this.formatNaiveDate(new Date(this.originalDatePriseEnCharge)),
      departAddress: data.lieuxPriseEnCharge,
      destinationAddress: data.lieuxDestination,
      destinationInputs: data.destinationInputs,
    };

    this._estimationService.calculateEstimation(formData).subscribe({
      next: (response: any) => {
        this.vehiculesDisponibles = response.transport_estimates;
        if (this.preRemplissageActif) {
          this.preRemplissage(response);
          this.loading = false;
          this.openConfirmationModal();
          this.preRemplissageActif = false;
        }
      },
      error: (error) => {
        console.error(error);
        if (attemptCount < 5) {
          setTimeout(() => this.calculateEstimation(attemptCount + 1, data), 2000);
        } else {
          console.error('Nombre maximal de tentatives atteint. Abandon.');
        }
      },
    });
  }

  get vehiculeOptions() {
    const options = this.vehiculesDisponibles.map(vehicule => ({
      label: `${vehicule.marque ? vehicule.marque : ''} ${vehicule.modele ? vehicule.modele : ''} (${vehicule.transport_type ? vehicule.transport_type : ''})`,
      value: vehicule.vehicule
    }));
    return options;
  }

  showDialog(type: 'verifierCode' | 'isValidation') {
    switch (type) {

      case 'verifierCode':
        this.display = true
        break;

      case 'isValidation':
        this.isValidation = true
        break;
    }
  }


  openConfirmationModal() {
    if (this.reservation.reservation_origine !== null || this.reservation.is_recurring) {
      this.contentManage = true
      this.showDialog('isValidation')

    } else {
      this.contentManage = false
      this.showDialog('isValidation')

    }
  }

  updatePaymentMethod(event: any): void {
    const newMethod = event.value;  // Ceci prend la nouvelle valeur sélectionnée
    this.reserverForm.get('modePaiement')?.setValue(newMethod);
    this.isModePaiementEdit = false;
    this.openConfirmationModal();
  }


  initAutocomplete() {
    if (this.lieuxPriseEnChargeInput) {
      const departAddressAutocomplete = new google.maps.places.Autocomplete(this.lieuxPriseEnChargeInput.nativeElement, {
        types: [],
      });
      departAddressAutocomplete.addListener('place_changed', () => {
        this.reserverForm.patchValue({ lieuxPriseEnCharge: this.lieuxPriseEnChargeInput.nativeElement.value });
      });
    }

    if (this.lieuxDestinationInput) {
      const destinationAddressAutocomplete = new google.maps.places.Autocomplete(this.lieuxDestinationInput.nativeElement, {
        types: [],
      });
      destinationAddressAutocomplete.addListener('place_changed', () => {
        this.reserverForm.patchValue({ lieuxDestination: this.lieuxDestinationInput.nativeElement.value });
      });
    }
  }

  updateNumeroReservation(): void {
    const data = this.reserverForm.getRawValue();
    const newNumeroReservation = this.genererNumeroReservation(data);
    this.reserverForm.get('numeroReservation')?.setValue(newNumeroReservation);
  }

  genererNumeroReservation(data: any): string {
    const anneeCourante = new Date().getFullYear();
    const timestamp = new Date().getTime().toString().slice(-4); // Les 4 derniers chiffres pour unicité

    const lieuPriseEnCharge = (data.lieuxPriseEnCharge || '').substring(0, 2).toUpperCase();
    const lieuDestination = (data.lieuxDestination || '').substring(0, 2).toUpperCase();
    const utilisateurId = data.utilisateur || '00';
    const nombrePassager = data.nombrePassager || 0;
    const nombreBagage = data.nombreBagage || 0;

    const numeroReservation = `${anneeCourante}R${utilisateurId}${lieuPriseEnCharge}${lieuDestination}${nombrePassager}${nombreBagage}${timestamp}`;
    return numeroReservation;
  }


  generatePassengerOptions(nombre_maximum: number): { label: string, value: number }[] {
    return Array.from({ length: nombre_maximum }, (_, i) => {
      const value = i + 1;
      return { label: value.toString(), value: value };
    });

  }


  selectVehicule(event: any): void {
    const selectedVehiculeId = event.value;
    this.isVehiculeEdit = false;
    this.isVehiculeModified = true;

    const selectedVehicule = this.vehiculesDisponibles.find(
      (v) => v.vehicule === selectedVehiculeId
    );

    if (selectedVehicule) {
      this.updateVehiculeNameInput(
        `${selectedVehicule.marque} ${selectedVehicule.modele} (${selectedVehicule.transport_type})`
      );

      const totalAttributCost = this.reserverForm.get('totalAttributCost')?.value || 0;
      const coutTransport = selectedVehicule.cout;
      const coutMajorer = selectedVehicule.cout_majoration || 0;
      const coutTotalReservation = coutTransport + coutMajorer + totalAttributCost;

      this.reserverForm.patchValue({
        vehicule: selectedVehiculeId,
        coutTransport: coutTransport,
        coutMajorer: coutMajorer,
        coutTotalReservation: coutTotalReservation,
      });

      this.openConfirmationModal();
    }
  }


  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  getFormattedPaymentMode(): string {
    const mode = this.reserverForm.get('modePaiement')?.value;
    switch (mode) {
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
        return 'Mode de paiement non spécifié';
    }
  }

  formatTypeBagages(type: string): string {
    switch (type) {
      case 'Cabine': return 'Bagage cabine';
      case 'M': return 'Valise moyenne';
      case 'L': return 'Valise large';
      case 'XL': return 'Valise extra-large';
      default: return type;
    }
  }

  combineBagageFields(): void {
    const nbre = this.reserverForm.get('nbre')?.value;
    const type_bagages = this.type_bagages;
    if (nbre && type_bagages) {
      const nombreBagage = `${nbre} ${type_bagages}`;
      this.reserverForm.patchValue({ nombreBagage });
    }
  }

  getVehiculeAndClient(user: any, vehicule: any) {
    const clientName = user.first_name && user.first_name !== 'XXXXX'
      ? `${user.first_name} ${user.last_name}`
      : user.last_name;
    this.updateClientNameInput(clientName);

    this.vehiculeData = vehicule;
    if (vehicule) {

      const capaciteChargementParts = vehicule.capacite_chargement.split(' ');

      if (capaciteChargementParts.length === 2) {
        this.capaciteChargement = parseInt(capaciteChargementParts[0], 10);
        this.type_bagages = this.formatTypeBagages(capaciteChargementParts[1]);
        this.reserverForm.patchValue({
          nbre: this.capaciteChargement,
        });
      }
    }

    this.updateVehiculeNameInput(`${vehicule.marque} ${vehicule.modele} (${vehicule.typeVehicule})`);

  }

  get passengers(): FormArray {
    return this.reserverForm.get('passengers') as FormArray;
  }


  removePassenger(index: number): void {
    // Supprime le passager du FormArray
    this.passengers.removeAt(index);

    // Mettez à jour les notes en supprimant le passager correspondant
    const passengerNoteIndex = this.reservation.notes.findIndex((note: { type: string; content: string | string[]; }) => note.type === 'passenger' && note.content.includes(`nom:`));
    if (passengerNoteIndex !== -1) {
      this.reservation.notes.splice(passengerNoteIndex + index, 1);  // Supprime la note du passager correspondant
    }

    // Ouvrir la modal de confirmation pour faire la mise à jour
    this.openConfirmationModal();
  }

  Field(fieldName: string, index?: number): void {
    if (fieldName === 'passenger' && index !== undefined) {
      this.isPassengerEdit[index] = true;
      this.reserverForm.get(['passengers', index])?.enable();
    } else if (fieldName === 'nombrePassager') {
      this.isNombrePassagerEdit = true;
      this.reserverForm.get('nombrePassager')?.enable();
    } else if (fieldName === 'nombreBagage') {
      this.isNombreBagageEdit = true;
      this.reserverForm.get('nbre')?.enable();
    } else if (fieldName === 'modePaiement') {
      this.isModePaiementEdit = true;
      this.reserverForm.get('modePaiement')?.enable();
    } else if (fieldName === 'compagnieAerienne') {
      this.originalCompagnieAerienne = this.reserverForm.get(fieldName)?.value;
      this.reserverForm.get('compagnieAerienne')?.enable();
      this.isCompagnieAerienneEdit = true;
    } else if (fieldName === 'numero_dossier') {
      this.originalNumeroDossier = this.reserverForm.get(fieldName)?.value;
      this.reserverForm.get('numero_dossier')?.enable();
      this.isNumeroDossierEdit = true;
    } else if (fieldName === 'note') {
      this.originalNote = this.reserverForm.get(fieldName)?.value;
      this.reserverForm.get('note')?.enable();
      this.isNoteEdit = true;
    } else if (fieldName === 'vehicule') {
      this.isVehiculeEdit = true;
    } else if (fieldName === 'coutTransport') {
      this.isCoutTransportEdit = true;
      this.originalCoutTransport = this.reserverForm.get(fieldName)?.value;
      this.reserverForm.get('coutTransport')?.enable();
    } else if (fieldName === 'coutMajorer') {
      this.isCoutMajorerEdit = true;
      this.originalCoutMajorer = this.reserverForm.get(fieldName)?.value;
      this.reserverForm.get('coutMajorer')?.enable();
    } else if (fieldName === 'totalAttributCost') {
      this.isTotalAttributCostEdit = true;
      this.originalAttributCost = this.reserverForm.get(fieldName)?.value;
      this.reserverForm.get('totalAttributCost')?.enable();
    } else if (fieldName === 'lieuxPriseEnCharge') {
      this.isLieuxPriseEnChargeEdit = true;
      this.originalLieuxPriseEnCharge = this.reserverForm.get(fieldName)?.value;
      this.reserverForm.get('lieuxPriseEnCharge')?.enable();
    } else if (fieldName === 'lieuxDestination') {
      this.isLieuxDestinationEdit = true;
      this.originalLieuxDestination = this.reserverForm.get(fieldName)?.value;
      this.reserverForm.get('lieuxDestination')?.enable();
    } else if (fieldName === 'datePriseEnCharge') {
      this.isDatePriseEnChargeEdit = true;
      this.reserverForm.get('datePriseEnChargeDate')?.enable();
      this.reserverForm.get('datePriseEnChargeTime')?.enable();
    }
  }

  validateEdit(fieldName: string, index?: number): void {
    if (fieldName === 'coutTransport' || fieldName === 'coutMajorer' || fieldName === 'totalAttributCost') {
      let coutTransport = parseFloat(this.reserverForm.get('coutTransport')?.value || 0);
      let coutMajorer = parseFloat(this.reserverForm.get('coutMajorer')?.value || 0);
      let totalAttributCost = parseFloat(this.reserverForm.get('totalAttributCost')?.value || 0);
      const coutTotalReservation = coutTransport + coutMajorer + totalAttributCost;
      this.reserverForm.get('coutTotalReservation')?.setValue(coutTotalReservation);
      this.openConfirmationModal();
    } else if (fieldName === 'lieuxPriseEnCharge' || fieldName === 'lieuxDestination') {
      const data = this.reserverForm.getRawValue();
      this.preRemplissageActif = true;
      this.loading = true;
      setTimeout(() => {
        this.calculateEstimation(0, data);
      }, 1000);
    } else if (fieldName === 'nombrePassager') {
      let value = this.reserverForm.get('nombrePassager')?.value;

      if (value < 1 || value > this.vehiculeData.capacite_passagers) {
        this.errorMessage = `Le nombre de passagers doit être compris entre 1 et ${this.vehiculeData.capacite_passagers}.`;
        this.showError(this.errorMessage);
      } else {
        if (value > this.vehiculeData.capacite_passagers) {
          value = this.vehiculeData.capacite_passagers;
          this.reserverForm.get('nombrePassager')?.setValue(value);
        }
        this.errorMessage = '';
        this.updateNumeroReservation();
        this.openConfirmationModal();
      }
    } else if (fieldName === 'modePaiement') {
      const mode = this.reserverForm.get('modePaiement')?.value;

      if (!this.paymentMethods.some(method => method.nom === mode)) {
        this.errorMessage = "Mode de paiement invalide.";
        this.showError(this.errorMessage);
      } else {
        this.errorMessage = '';
        this.openConfirmationModal();
      }
    } else if (fieldName === 'nombreBagage') {
      let value = this.reserverForm.get('nbre')?.value;
      if (value < 1 || value > this.capaciteChargement) {
        this.errorMessage = `Le nombre de bagages doit être compris entre 1 et ${this.capaciteChargement}.`;
        this.showError(this.errorMessage);
      } else {
        this.combineBagageFields();
        this.errorMessage = '';
        this.updateNumeroReservation();
        this.openConfirmationModal();
      }
    } else if (fieldName === 'datePriseEnCharge' && this.isDatePriseEnChargeEdit) {
      const date = this.reserverForm.get('datePriseEnChargeDate')?.getRawValue();
      const time = this.reserverForm.get('datePriseEnChargeTime')?.getRawValue();
      if (!date || !time) {
        this.errorMessage = "La date et l'heure de prise en charge sont requises.";
        return;
      } else {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        const seconds = String(time.getSeconds()).padStart(2, '0');
        const combinedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        const data = this.reserverForm.getRawValue();
        this.originalDatePriseEnCharge = combinedDateTime;
        this.preRemplissageActif = true;

        this.loading = true;
        setTimeout(() => {
          this.calculateEstimation(0, data);
        }, 1000);
      }
    } else if (fieldName === 'note') {
      const updatedNote = this.reserverForm.get('note')?.value;
      const noteIndex = this.reservation.notes.findIndex((note: { type: string; }) => note.type === 'note');

      if (noteIndex !== -1) {
        this.reservation.notes[noteIndex].content = updatedNote;
      } else {
        this.reservation.notes.push({ type: 'note', content: updatedNote });
      }

      this.openConfirmationModal();
    } else if (fieldName === 'passenger' && index !== undefined) {
      const updatedPassenger = this.reserverForm.get(['passengers', index])?.value;
      const passengerNoteIndex = this.reservation.notes.findIndex((note: { type: string; content: string; }) => note.type === 'passenger' && note.content.includes(`nom:`));

      if (passengerNoteIndex !== -1) {
        this.reservation.notes[passengerNoteIndex + index].content = `nom: ${updatedPassenger.name}, numero: ${updatedPassenger.phone}`;
      } else {
        this.reservation.notes.push({ type: 'passenger', content: `nom: ${updatedPassenger.name}, numero: ${updatedPassenger.phone}` });
      }

      this.openConfirmationModal();
    } else {
      this.openConfirmationModal();
    }
    this.resetEditStates();
  }

  cancelEdit(fieldName: string, index?: number): void {
    let originalValue;
    switch (fieldName) {
      case 'compagnieAerienne':
        originalValue = this.originalCompagnieAerienne;
        break;
      case 'numero_dossier':
        originalValue = this.originalNumeroDossier;
        break;
      case 'note':
        originalValue = this.originalNote;
        break;
      case 'coutTransport':
        originalValue = this.originalCoutTransport;
        break;
      case 'coutMajorer':
        originalValue = this.originalCoutMajorer;
        break;
      case 'totalAttributCost':
        originalValue = this.originalAttributCost;
        break;
      case 'lieuxPriseEnCharge':
        originalValue = this.originalLieuxPriseEnCharge;
        break;
      case 'lieuxDestination':
        originalValue = this.originalLieuxDestination;
        break;
      case 'datePriseEnCharge':
        originalValue = this.originalDatePriseEnCharge;
        break;
      case 'nombrePassager':
        originalValue = this.originalNombrePassager;
        break;
      case 'nombreBagage':
        originalValue = this.originalNombreBagages;
        break;
      case 'modePaiement':
        originalValue = this.originalModePaiement;
        break;
      case 'passenger':
        if (index !== undefined) {
          originalValue = this.reservation.notes.find((note: { type: string; content: string; }) => note.type === 'passenger' && note.content.includes(`nom:`))?.content;
          if (originalValue) {
            this.reserverForm.get(['passengers', index])?.patchValue({
              name: originalValue.split(',')[0].split(':')[1].trim(),
              phone: originalValue.split(',')[1].split(':')[1].trim()
            });
          }
          this.isPassengerEdit[index] = false;
        }
        return;
      default:
        console.log(`Field name ${fieldName} not recognized.`);
        return;
    }
    this.reserverForm.get(fieldName)?.setValue(originalValue);
    this.resetEditStates();
  }


  updateRecurrentReservation(action: string): void {
    const rawData = this.reserverForm.getRawValue();

    const notes = [...this.reservation.notes];
    const noteIndex = notes.findIndex(note => note.type === 'note');
    const updatedNote = rawData.note;

    if (noteIndex !== -1) {
      notes[noteIndex].content = updatedNote;
    } else {
      notes.push({ type: 'note', content: updatedNote });
    }

    // Update passenger notes
    rawData.passengers.forEach((passenger: any, index: number) => {
      const passengerNoteIndex = notes.findIndex(note => note.type === 'passenger' && note.content.includes(`nom:`));
      if (passengerNoteIndex !== -1) {
        notes[passengerNoteIndex + index].content = `nom: ${passenger.name}, numero: ${passenger.phone}`;
      } else {
        notes.push({ type: 'passenger', content: `nom: ${passenger.name}, numero: ${passenger.phone}` });
      }
    });

    const modifications = {
      ...rawData,
      notes: notes,
      datePriseEnCharge: this.originalDatePriseEnCharge,
      utilisateur: this.originalUtilisateur,
    };

    if (!this.isVehiculeModified) {
      modifications.vehicule = this.originalVehicule;
    }

    this.loading = true;
    setTimeout(() => {
      this._estimationService.modifierReservation(this.reservationId, modifications, action).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Réservation mise à jour avec succès', response);
          this.successMessage = response.message;
          this.showSuccess(this.successMessage);
          this.getReservation()
        },
        error: (err) => {
          this.loading = false;
          console.error('Erreur lors de la mise à jour de la réservation', err);
          this.errorMessage = 'Erreur lors de la mise à jour de la réservation';
          this.showError(this.errorMessage);
        }
      });
    }, 1000);
  }

  prepareAndUpdateReservation(): void {
    const rawData = this.reserverForm.getRawValue();

    const notes = [...this.reservation.notes];
    const noteIndex = notes.findIndex(note => note.type === 'note');
    const updatedNote = rawData.note;

    if (noteIndex !== -1) {
      notes[noteIndex].content = updatedNote;
    } else {
      notes.push({ type: 'note', content: updatedNote });
    }

    // Update passenger notes
    rawData.passengers.forEach((passenger: any, index: number) => {
      const passengerNoteIndex = notes.findIndex(note => note.type === 'passenger' && note.content.includes(`nom:`));
      if (passengerNoteIndex !== -1) {
        notes[passengerNoteIndex + index].content = `nom: ${passenger.name}, numero: ${passenger.phone}`;
      } else {
        notes.push({ type: 'passenger', content: `nom: ${passenger.name}, numero: ${passenger.phone}` });
      }
    });

    const updateData = {
      ...rawData,
      notes: notes,
      datePriseEnCharge: this.formatNaiveDate(new Date(this.originalDatePriseEnCharge)),
      utilisateur: this.originalUtilisateur,
    };

    if (!this.isVehiculeModified) {
      updateData.vehicule = this.originalVehicule;
    }

    this.loading = true;
    this._estimationService.updateReservation(this.reservationId, updateData).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Réservation mise à jour avec succès', response);
        this.successMessage = 'Réservation mise à jour avec succès';
        this.showSuccess(this.successMessage);
        this.getReservation()
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors de la mise à jour de la réservation', error);
        this.showError(this.errorMessage);
      },
    });
  }

  resetEditStates(): void {
    this.isLieuxDestinationEdit = false;
    this.isLieuxPriseEnChargeEdit = false;
    this.isCompagnieAerienneEdit = false;
    this.isNoteEdit = false;
    this.isCoutTransportEdit = false;
    this.isCoutMajorerEdit = false;
    this.isTotalAttributCostEdit = false;
    this.isDatePriseEnChargeEdit = false;
    this.isNumeroDossierEdit = false;
    this.isNombrePassagerEdit = false;
    this.isNombreBagageEdit = false;
    this.isModePaiementEdit = false;
    this.isPassengerEdit.fill(false);
  }

  addPassenger(): void {
    this.isAddingPassenger = true;
  }

  saveNewPassenger(): void {
    const passengersFormArray = this.reserverForm.get('passengers') as FormArray;
    passengersFormArray.push(this.fb.group({
      name: this.newPassengerForm.get('name')?.value,
      phone: this.newPassengerForm.get('phone')?.value
    }));

    const newPassengerNote = `nom: ${this.newPassengerForm.get('name')?.value}, numero: ${this.newPassengerForm.get('phone')?.value}`;
    this.reservation.notes.push({ type: 'passenger', content: newPassengerNote });

    this.isAddingPassenger = false;
    this.newPassengerForm.reset();
    this.openConfirmationModal();
  }

  cancelNewPassenger(): void {
    this.isAddingPassenger = false;
    this.newPassengerForm.reset();
  }
}
