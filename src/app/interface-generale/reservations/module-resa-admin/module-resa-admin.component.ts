import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, startWith } from 'rxjs';
import { debounceTime, map, distinctUntilChanged, filter } from 'rxjs/operators';
import { MenuItem, MessageService } from 'primeng/api';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { Methode } from '../../../utilitaires/models/parametres';
declare var google: any;

@Component({
  selector: 'app-module-resa-admin',
  templateUrl: './module-resa-admin.component.html',
  styleUrls: ['./module-resa-admin.component.css']
})
export class ModuleResaAdminComponent implements OnInit {
  isLoading: boolean = false;
  showDateTimeFields: boolean = false;
  showPassengerFields: boolean = false;
  private lastValidState: boolean | null = null;
  directionsRenderer: any;
  startMarker: any;
  endMarker: any;
  estimationForm: FormGroup;
  travelType: string = 'allerSimple';
  formSubmitted = false;
  breadcrumbItems: MenuItem[] = [];
  estimations: any;
  loading: boolean = false;
  transportEstimates: any;
  form: FormGroup;
  attributsFormArray!: FormArray;
  vehicules: any[] = [];
  map: any;
  @ViewChild('mapContainer', { static: false }) gmap!: ElementRef;
  @ViewChild('content') content!: TemplateRef<any>;
  lat = 45.75; lng = 4.85;
  showVehiculeList: boolean = true;
  isWelcomeTextVisible: boolean = false;
  selectedVehicule: any = null;
  capaciteChargement: number = 0;
  capacitePassagers: number = 0;
  selectedEstimation: any;
  isVehiculeSelected: boolean = false;
  valider: boolean = false;
  sectionValiderVisible: boolean = false;
  erreurReservationNonRenseignee = false;
  paymentMethods: any[] = [];
  errorMessage!: string;
  clientType: string = 'ancien';
  vehiculeData: any;
  clients: any;
  reserverForm: FormGroup;
  coutTotal: number = 0
  vehiculeChoisi: boolean = true;
  coutTransport: number = 0;
  coutMajorer: number = 0;
  totalAttributCost = 0; // Coût total des attributs sélectionnés
  coutTotalReservation = 0;
  MessageVisible = false;
  msg!: string;
  succes: boolean = false
  informationsClient: any = {};
  clientDetails: any
  reservationData: any;
  successMessage: string = ''
  currentStep: number = 1;
  estimer: boolean = false;
  devis: boolean = false;
  reserve: boolean = false;
  alertMessage: string = '';
  typeClientOptions: string[] = ['client_simple', 'client_liee_agence', 'client_liee_societe', 'client_societe', 'client_agence']; // Options pour le type de client
  type_bagages: any;
  cardVisibility: boolean[] = [false, false, false, false]; // Indicateurs de visibilité pour chaque carte
  layout: string = 'list';
  isCalculating: boolean = false; // Drapeau pour éviter les boucles infinies

  constructor(
    private fb: FormBuilder,
    private _estimationService: CrmService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.directionsRenderer = new google.maps.DirectionsRenderer();

    this.attributsFormArray = this.fb.array([]);
    this.isWelcomeTextVisible = false;
    this.estimationForm = this.fb.group({
      datePriseEnChargeDate: ['', Validators.required],
      datePriseEnChargeTime: ['', Validators.required],
      dateRetourDate: [''],
      dateRetourTime: ['', Validators.required],
      departAddress: ['', Validators.required],
      destinationAddress: ['', Validators.required],
      destinationInputs: this.fb.array([]),
    });

    this.form = this.fb.group({
      distParcourt: ['', Validators.required],
      durParcourt: ['', Validators.required],
      datePriseEnCharge: ['', Validators.required],
      dateRetour: [null],
      distanceWaypoint: [null],
      dureeWaypoint: [null],
      lieuxPriseEnCharge: ['', Validators.required],
      lieuxDestination: ['', Validators.required],
      destinationInputs: this.fb.array([]),
      typeVehicule: ['', Validators.required],
      vehicule: [null, Validators.required],
      coutTransport: ['', Validators.required],
      coutMajorer: ['', Validators.required],
      attribut: this.attributsFormArray,
      coutTotalReservation: ['', Validators.required],
      totalAttributCost: ['', Validators.required],
      notes: this.fb.array([]),
      nombreBagage: [''],
      vehiculeView: [''],
      nombrePassager: [''],
      compagnieAerienne: [''],
    });

    this.reserverForm = this.fb.group({
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
      attribut: this.fb.array([]),
      notes: this.fb.array([]),
      nombreBagage: [''],
      nombrePassager: ['', Validators.required],
      compagnieAerienne: [''],
      modePaiement: ['', Validators.required],
      statutReservation: ['', Validators.required],
      numero_dossier: [''],
      first_name: [''],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
      typeCompte: ['', Validators.required],
      type_utilisateur: ['client', Validators.required],
      type_client: ['client_simple', Validators.required],
      is_complete: [false],
      cle_agence: [''],
      cle_societe: [''],
      nom_societe: [''],
      adresse_societe: [''],
      email_societe: [''],
      telephone_societe: [''],
      nom_agence: [''],
      adresse_agence: [''],
      email_agence: [''],
      telephone_agence: [''],
      nbre: ['', Validators.required],
      passengers: this.fb.array([]),
      note: [''],
      commission: [10],
      compensation: [0],
      commissionAmount: [0],
      coutDeVente: [''],
      lieu_rendez_vous: ['', Validators.required],
    });

    this.showPassengerFields = false;

    // Surveillance des changements de valeurs dans le formulaire
    this.reserverForm.valueChanges.subscribe(values => {
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Réservations' });
    this.breadcrumbItems.push({ label: 'Module de réservation' });

    this.reserverForm.get('client_selectionne')?.valueChanges.subscribe(value => {
      this.onClientSelected(value);
    });

    // Utiliser debounceTime pour éviter le calcul excessif et accélérer l'affichage
    this.reserverForm.get('commission')?.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      if (!this.isCalculating) {
        this.calculate();
      }
    });

    this.reserverForm.get('commissionAmount')?.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      if (!this.isCalculating) {
        this.calculate();
      }
    });

    this.reserverForm.get('compensation')?.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      if (!this.isCalculating) {
        this.calculate();
      }
    });

    this.loadPayement()
    this.getClient()
    this.fetchAttributsFromDatabase()
    this.setupEstimationTrigger()
  }

  ngAfterViewInit() {
    this.initAutocomplete();
    const mapOptions = {
      center: new google.maps.LatLng(this.lat, this.lng),
      zoom: 10,
    };
    this.map = new google.maps.Map(this.gmap.nativeElement, mapOptions);
    this.directionsRenderer.setMap(this.map);

    this.initMap();
  }


  initMap(): void {
    setTimeout(() => {
      if (this.gmap && this.gmap.nativeElement) {
        const mapOptions = {
          center: new google.maps.LatLng(this.lat, this.lng),
          zoom: 10,
        };
        this.map = new google.maps.Map(this.gmap.nativeElement, mapOptions);
        this.directionsRenderer.setMap(this.map);
      } else {
        console.error("gmap nativeElement is not available");
      }
    }, 100);
  }

  displaySimpleMap2(): void {
    // Vous pouvez vérifier ici si c'est bien l'étape 5 avant d'appeler initMap
    if (this.currentStep === 5) {
      this.initMap();
    }
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/reservations']);
  }

  reload(): void {
    window.location.reload();
  }

  nextStep(nextCallback: any): void {
    if (++this.currentStep === 5) {
      this.displaySimpleMap2();
    } else if (this.currentStep === 4) {
      this.calculate();
    }
    nextCallback.emit();
    this.cdr.detectChanges();
  }


  prevStep(prevCallback: any): void {
    if (this.currentStep > 1) {
      this.currentStep--;

      if (this.currentStep === 1) {
        this.displaySimpleMap();
      } else if (this.currentStep === 4) {
        this.valider = false;
        this.sectionValiderVisible = false;
        this.reloadStep4Data();
      }
      prevCallback.emit(); // Emit the callback to transition the stepper
      this.cdr.detectChanges();
    }
  }

  reloadStep4Data(): void {
    this.reserverForm.get('client_selectionne')?.updateValueAndValidity();
    this.reserverForm.get('type_client')?.updateValueAndValidity();
  }

  displaySimpleMap(): void {
    setTimeout(() => {
      if (this.gmap && this.gmap.nativeElement) {
        const mapOptions = {
          center: new google.maps.LatLng(this.lat, this.lng),
          zoom: 10,
        };
        this.map = new google.maps.Map(this.gmap.nativeElement, mapOptions);
        this.directionsRenderer.setMap(this.map);
      } else {
        console.error("gmap nativeElement is not available");
      }
    }, 100);
  }

  isStep3FieldsFilled(): boolean {
    const fields = ['nombrePassager', 'nbre', 'modePaiement', 'lieu_rendez_vous'];  // <-- Added 'lieu_rendez_vous' here
    let allFieldsFilled = true;

    for (let field of fields) {
      const control = this.reserverForm.get(field);
      if (!control || control.value === null || control.value === '') {
        allFieldsFilled = false;
      }
    }

    return allFieldsFilled;
  }

  combineBagageFields(): void {
    const nbre = this.reserverForm.get('nbre')?.value;
    const type_bagages = this.type_bagages;
    if (nbre && type_bagages) {
      const nombreBagage = `${nbre} ${type_bagages}`;
      this.reserverForm.patchValue({ nombreBagage });
    }
  }

  getPrixReservation(vehiculeId: number): number {
    const estimate = this.transportEstimates.find((e: { vehicule: number; }) => e.vehicule === vehiculeId);
    return estimate ? estimate.cout : 0;
  }

  isForValidation(): boolean {
    return (
      this.estimationForm.get('datePriseEnChargeDate')?.valid &&
      this.estimationForm.get('datePriseEnChargeTime')?.valid &&
      this.estimationForm.get('departAddress')?.valid &&
      this.estimationForm.get('destinationAddress')?.valid
    ) as boolean;
  }

  isSelected(vehicule: any): boolean {
    this.isVehiculeSelected = this.selectedVehicule === vehicule;
    return this.isVehiculeSelected;
  }

  fetchAttributsFromDatabase() {
    this._estimationService.getAllAttribut().subscribe((attributs) => {
      attributs.forEach((attribut: { nom_attribut: any; nombre_maximum: any; prix_unitaire_attribut: any; }) => {
        if (this.attributsFormArray) {
          this.attributsFormArray.push(this.fb.group({
            nom_attribut: attribut.nom_attribut,
            nombre_maximum: attribut.nombre_maximum,
            prix_unitaire_attribut: attribut.prix_unitaire_attribut,
            quantite: 0
          }));
        }
      });
    });
  }

  private getAttributControl(index: number) {
    if (this.attributsFormArray) {
      return this.attributsFormArray.at(index) as FormGroup;
    }
    return null;
  }

  toggleFormVisibility() {
    this.calculateTotalCost();
    this.preFillDataToReserverForm();
    this.dataCenter();
  }

  dataCenter() {
    if (!this.selectedVehicule) {
      this.MessageVisible = true;
      this.msg = "Vous devez choisir un vehicule avant de pouvoir continuer";
      return;
    } else {
      this.form.patchValue({
        coutTotalReservation: this.coutTotalReservation || (this.selectedEstimation?.cout_majoration || this.selectedEstimation?.cout),
        totalAttributCost: this.totalAttributCost,
      });
    }
  }

  preFillDataToReserverForm() {
    if (this.reserverForm && this.attributsFormArray) {
      const attributsArray = this.attributsFormArray.controls.map(control => {
        return this.fb.group({
          nom_attribut: control.get('nom_attribut')?.value,
          nombre_maximum: control.get('nombre_maximum')?.value,
          prix_unitaire_attribut: control.get('prix_unitaire_attribut')?.value,
          quantite: control.get('quantite')?.value
        });
      });
      this.reserverForm.setControl('attribut', this.fb.array(attributsArray));
    }
  }

  incrementQuantity(index: number) {
    const attributControl = this.getAttributControl(index);
    if (attributControl) {
      const quantiteControl = attributControl.get('quantite');
      const nombreMaximum = attributControl.get('nombre_maximum')?.value;
      if (quantiteControl && quantiteControl.value < nombreMaximum) {
        quantiteControl.setValue(quantiteControl.value + 1);
        this.calculateTotalCost();
      }
    }
  }

  decrementQuantity(index: number) {
    const attributControl = this.getAttributControl(index);
    if (attributControl) {
      const quantiteControl = attributControl.get('quantite');
      if (quantiteControl && quantiteControl.value > 0) {
        quantiteControl.setValue(quantiteControl.value - 1);
        this.calculateTotalCost();
      }
    }
  }

  calculateTotalCost() {
    let totalCost = 0;
    if (this.attributsFormArray) {
      this.attributsFormArray.controls.forEach(control => {
        const quantite = (control.get('quantite') as any).value;
        const prixUnitaire = (control.get('prix_unitaire_attribut') as any).value;
        totalCost += quantite * prixUnitaire;
      });
    }
    this.coutTotal = totalCost;
    this.totalAttributCost = this.coutTotal;
    this.mettreAJourCoutTotalReservation();
  }

  mettreAJourCoutTotalReservation() {
    if (this.selectedEstimation) {
      this.coutTotalReservation = this.selectedEstimation.coutMajorer || this.selectedEstimation.cout;
      if (this.coutTotal > 0) {
        this.coutTotalReservation += this.coutTotal;
      }
    }
  }

  initAutocomplete() {
    const mapOptions = {
      center: new google.maps.LatLng(this.lat, this.lng),
      zoom: 10,
    };
    this.map = new google.maps.Map(this.gmap.nativeElement, mapOptions);

    let startPosition: { lat: number; lng: number; };
    let endPosition: { lat: number; lng: number; };

    const departAddressInput = document.getElementById('departAddress') as HTMLInputElement;
    const departAddressAutocomplete = new google.maps.places.Autocomplete(departAddressInput);
    departAddressAutocomplete.addListener('place_changed', () => {
      const place = departAddressAutocomplete.getPlace();
      if (place.geometry) {
        startPosition = place.geometry.location.toJSON();
        this.displayMarker(startPosition, 'Departure');
        this.map.setCenter(startPosition);
        this.estimationForm.patchValue({ departAddress: departAddressInput.value });
        this.checkIfAddressesFilled(startPosition, endPosition);
      }
    });

    const destinationAddressInput = document.getElementById('destinationAddress') as HTMLInputElement;
    const destinationAddressAutocomplete = new google.maps.places.Autocomplete(destinationAddressInput);
    destinationAddressAutocomplete.addListener('place_changed', () => {
      const place = destinationAddressAutocomplete.getPlace();
      if (place.geometry) {
        endPosition = place.geometry.location.toJSON();
        this.displayMarker(endPosition, 'Destination');
        this.map.setCenter(endPosition);
        this.estimationForm.patchValue({ destinationAddress: destinationAddressInput.value });
        this.checkIfAddressesFilled(startPosition, endPosition);
      }
    });
  }

  checkIfAddressesFilled(startPosition: { lat: number; lng: number; }, endPosition: { lat: number; lng: number; }) {
    if (startPosition && endPosition) {
      this.showDateTimeFields = true;
      this.displayRoute(startPosition, endPosition);
      this.cdr.detectChanges();
    } else {
      this.showDateTimeFields = false;
    }
  }

  displayRoute(start: { lat: number; lng: number }, end: { lat: number; lng: number }): void {
    const directionsService = new google.maps.DirectionsService();
    this.directionsRenderer.set('directions', null);

    directionsService.route({
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result: any, status: string) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsRenderer.setDirections(result);
      } else {
        console.error('Erreur lors du calcul de l’itinéraire: ' + status);
      }
    });
  }

  displayMarker(location: { lat: number, lng: number }, title?: string): void {
    if (title === 'Departure' && this.startMarker) {
      this.startMarker.setMap(null);
    } else if (title === 'Destination' && this.endMarker) {
      this.endMarker.setMap(null);
    }

    const marker = new google.maps.Marker({
      position: location,
      map: this.map,
      title: title,
    });

    if (title === 'Departure') {
      this.startMarker = marker;
    } else if (title === 'Destination') {
      this.endMarker = marker;
    }
  }

  toggleSelection(vehicule: any) {
    this.selectedVehicule = this.selectedVehicule === vehicule ? null : vehicule;

    if (this.selectedVehicule) {
      const estimationMap = new Map(this.transportEstimates.map((estimate: any) => [estimate.vehicule, estimate]));
      this.selectedEstimation = estimationMap.get(this.selectedVehicule.id);

      if (this.selectedEstimation) {
        this.preRemplirInformations(this.selectedEstimation);
        const capaciteChargementParts = this.selectedEstimation.capacite_chargement.split(' ');
        if (capaciteChargementParts.length === 2) {
          this.capaciteChargement = parseInt(capaciteChargementParts[0], 10);
          this.type_bagages = this.formatTypeBagages(capaciteChargementParts[1]);
        }

        this.capacitePassagers = parseInt(this.selectedEstimation.capacite_passagers, 10);
      }

      if (this.currentStep === 2 && this.selectedVehicule !== null && this.formSubmitted) {
        this.cardVisibility[1] = true;
      }
    } else {
      this.form.patchValue({
        typeVehicule: null,
        coutTransport: null,
        coutMajorer: null,
      });

      this.selectedEstimation = null;
    }

    this.cdr.detectChanges();
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

  preRemplirInformations(estimate: any) {
    this.form.patchValue({
      typeVehicule: estimate.transport_type,
      coutTransport: estimate.cout,
      coutMajorer: estimate.cout_majoration,
      vehicule: estimate.vehicule,
      vehiculeView: this.selectedVehicule.id
    });
  }

  setupEstimationTrigger() {
    if (this.estimationForm.get('datePriseEnChargeDate') && this.estimationForm.get('datePriseEnChargeTime') &&
      this.estimationForm.get('departAddress') && this.estimationForm.get('destinationAddress')) {

      const datePriseEnChargeDate$ = this.estimationForm.get('datePriseEnChargeDate')!.valueChanges.pipe(
        startWith(this.estimationForm.get('datePriseEnChargeDate')?.value),
        debounceTime(1000),
        distinctUntilChanged()
      );
      const datePriseEnChargeTime$ = this.estimationForm.get('datePriseEnChargeTime')!.valueChanges.pipe(
        startWith(this.estimationForm.get('datePriseEnChargeTime')?.value),
        debounceTime(1000),
        distinctUntilChanged(),
        filter((time) => this.isTimeValid(time))
      );
      const departAddress$ = this.estimationForm.get('departAddress')!.valueChanges.pipe(
        startWith(this.estimationForm.get('departAddress')?.value),
        debounceTime(1000),
        distinctUntilChanged()
      );
      const destinationAddress$ = this.estimationForm.get('destinationAddress')!.valueChanges.pipe(
        startWith(this.estimationForm.get('destinationAddress')?.value),
        debounceTime(1000),
        distinctUntilChanged()
      );

      combineLatest([datePriseEnChargeDate$, datePriseEnChargeTime$, departAddress$, destinationAddress$]).pipe(
        distinctUntilChanged(),
        map(() => {
          return this.isForValidation();
        })
      ).subscribe((isValid) => {
        if (isValid !== this.lastValidState) {
          this.lastValidState = isValid;
          if (isValid) {
            this.isLoading = true
            this.cdr.detectChanges();
            this.calculateEstimation();
          }
        }
      });
    } else {
      console.error("One or more form controls are undefined.");
    }
  }

  isTimeValid(time: string): boolean {
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timePattern.test(time);
  }

  calculateEstimation() {
    const datePriseEnChargeDateControl = this.estimationForm.get('datePriseEnChargeDate');
    const datePriseEnChargeTimeControl = this.estimationForm.get('datePriseEnChargeTime');
    if (datePriseEnChargeDateControl && datePriseEnChargeTimeControl) {
      const datePriseEnChargeDateValue = datePriseEnChargeDateControl.value;
      const datePriseEnChargeTimeValue = datePriseEnChargeTimeControl.value;
      const dateTimeValue = `${datePriseEnChargeDateValue}T${datePriseEnChargeTimeValue}`;
      const datePriseEnChargeValue = dateTimeValue;

      const dateRetourDateControl = this.estimationForm.get('dateRetourDate');
      const dateRetourTimeControl = this.estimationForm.get('dateRetourTime');
      const dateRetourDateValue = dateRetourDateControl ? dateRetourDateControl.value : null;
      const dateRetourTimeValue = dateRetourTimeControl ? dateRetourTimeControl.value : null;
      const dateTimeValueRetour = dateRetourDateValue && dateRetourTimeValue ? `${dateRetourDateValue}T${dateRetourTimeValue}` : null;
      const dateRetourValue = dateTimeValueRetour;

      const departAddress = this.estimationForm.get('departAddress')?.value;
      const destinationAddress = this.estimationForm.get('destinationAddress')?.value;
      const destinationInputs = this.estimationForm.get('destinationInputs') as FormArray;
      const destinationAddresses: string[] = [];

      destinationInputs.controls.forEach(control => {
        const destinationAddress = control.value;
        if (destinationAddress) {
          destinationAddresses.push(destinationAddress);
        }
      });

      const formData = {
        datePriseEnCharge: datePriseEnChargeValue,
        dateRetour: dateRetourValue,
        departAddress: departAddress,
        destinationAddress: destinationAddress,
        destinationInputs: destinationAddresses,
      };
      this._estimationService.calculateEstimation(formData).subscribe(
        (response: any) => {
          setTimeout(() => {
            this.estimations = response;
            this.transportEstimates = response.transport_estimates;

            this.isLoading = false
            this.cardVisibility[0] = true;
            this.formSubmitted = true;

            this.form.patchValue({
              distParcourt: this.estimations.distParcourt,
              durParcourt: this.estimations.durParcourt,
              datePriseEnCharge: datePriseEnChargeValue,
              dateRetour: dateRetourValue,
              lieuxPriseEnCharge: departAddress,
              lieuxDestination: destinationAddress,
            });
            console.log(response)
            this.getVehicules();
            this.cdr.detectChanges();
          }, 2000); // Réduit le délai à 2 secondes pour une meilleure expérience utilisateur
        },
        (error: any) => {
          this.formSubmitted = false;
          this.loading = false;
          console.error(error);
        }
      );
    }
  }

  getVehicules(): void {
    this._estimationService.getVehicules().subscribe((data: any[]) => {
      // Filtrer les véhicules en fonction des données d'estimation
      if (this.estimations && this.estimations.transport_estimates) {
        const vehiculeIds = this.estimations.transport_estimates.map(
          (estimate: { vehicule: any; }) => estimate.vehicule
        );
        this.vehicules = data.filter((vehicule: { id: any; }) =>
          vehiculeIds.includes(vehicule.id)
        );
        console.log('vehicules', this.vehicules)

      }
    });
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  createEstimation(): void {
    this.calculateTotalCost();
    this.dataCenter();
    const formValue = this.reserverForm.value;
    const notes = formValue.passengers.map((p: { name: any; phone: any; }) => ({
      type: 'passenger',
      content: `Nom: ${p.name}, Numero: ${p.phone}`
    }));

    if (formValue.note) {
      notes.push({ type: 'note', content: formValue.note });
    }

    this.form.patchValue({
      notes: notes,
      nombreBagage: parseInt(formValue.nombreBagage, 10),
      nombrePassager: parseInt(formValue.nombrePassager, 10),
      compagnieAerienne: formValue.compagnieAerienne,
      numero_dossier: formValue.numero_dossier,
    });
    this.loading = true;
    setTimeout(() => {
      this._estimationService.createEstimationFinal(this.form.value).subscribe({
        next: (reponse) => {
          this.loading = false;
          this.successMessage = 'estimation enregister avec succes.';
          this.showSuccess(this.successMessage)
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la création de l\'estimation.';
          this.showSuccess(this.errorMessage)
          this.loading = false;
          console.error(error); // Gestion des erreurs
        }
      });
    }, 1000);
  }

  get passengers(): FormArray {
    return this.reserverForm.get('passengers') as FormArray;
  }

  addPassenger(): void {
    if (this.passengers.invalid) {
      this.alertMessage = 'Veuillez remplir tous les champs de passagers avant d\'ajouter un autre passager.';
      this.showError(this.alertMessage)
      return;
    }
    this.passengers.push(this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required]
    }));
    this.cdr.detectChanges();
  }

  removePassenger(index: number): void {
    this.passengers.removeAt(index);
    this.cdr.detectChanges();
  }

  generateOptions(nombre_maximum: number): number[] {
    return Array.from({ length: nombre_maximum }, (_, i) => i + 1);
  }
  // Récupérer le nombre maximum d'attributs pour un contrôle donné
  getNombreMaximum(attributControl: AbstractControl): number {
    return attributControl.get('nombre_maximum')?.value ?? 1; // Par défaut, si la valeur est nulle, nous utilisons 1
  }
  loadPayement() {
    this._estimationService.getAllMethodePayement().subscribe((data: Methode[]) => {
      this.paymentMethods = data
        .filter(methode => methode.is_active)
        .map(methode => ({
          nom: methode.nom,
          label: this.formatPaymentMethodName(methode.nom),
          description: methode.description
        }));
    });
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

  changeClientType(type: string) {
    this.clientType = type;
    this.cdr.detectChanges();
  }

  getClient() {
    this._estimationService.getClients().subscribe((data: any) => {
      this.clients = data.clients;
    }, error => {
      console.error('Erreur lors de la récupération des clients:', error);
    });
  }

  onTypeClientChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const typeClient = selectElement.value;
    this.reserverForm.get('type_client')?.setValue(typeClient);
    this.setValidators(typeClient);
  }

  setValidators(typeClient: string): void {
    if (typeClient === 'client_simple') {
      this.reserverForm.get('first_name')?.setValidators([Validators.required]);
      this.reserverForm.get('last_name')?.setValidators([Validators.required]);
      this.clearValidators(['cle_agence', 'cle_societe', 'nom_societe', 'adresse_societe', 'email_societe', 'telephone_societe', 'nom_agence', 'adresse_agence', 'email_agence', 'telephone_agence']);
    } else if (typeClient === 'client_liee_agence') {
      this.reserverForm.get('first_name')?.setValidators([Validators.required]);
      this.reserverForm.get('last_name')?.setValidators([Validators.required]);
      this.reserverForm.get('cle_agence')?.setValidators([Validators.required]);
      this.clearValidators(['cle_societe', 'nom_societe', 'adresse_societe', 'email_societe', 'telephone_societe', 'nom_agence', 'adresse_agence', 'email_agence', 'telephone_agence']);
    } else if (typeClient === 'client_liee_societe') {
      this.reserverForm.get('first_name')?.setValidators([Validators.required]);
      this.reserverForm.get('last_name')?.setValidators([Validators.required]);
      this.reserverForm.get('cle_societe')?.setValidators([Validators.required]);
      this.clearValidators(['cle_agence', 'nom_societe', 'adresse_societe', 'email_societe', 'telephone_societe', 'nom_agence', 'adresse_agence', 'email_agence', 'telephone_agence']);
    } else if (typeClient === 'client_societe') {
      this.reserverForm.get('nom_societe')?.setValidators([Validators.required]);
      this.reserverForm.get('adresse_societe')?.setValidators([Validators.required]);
      this.reserverForm.get('email_societe')?.setValidators([Validators.required, Validators.email]);
      this.reserverForm.get('telephone_societe')?.setValidators([Validators.required]);
      this.clearValidators(['cle_agence', 'cle_societe', 'first_name', 'last_name', 'nom_agence', 'adresse_agence', 'email_agence', 'telephone_agence']);
    } else if (typeClient === 'client_agence') {
      this.reserverForm.get('nom_agence')?.setValidators([Validators.required]);
      this.reserverForm.get('adresse_agence')?.setValidators([Validators.required]);
      this.reserverForm.get('email_agence')?.setValidators([Validators.required, Validators.email]);
      this.reserverForm.get('telephone_agence')?.setValidators([Validators.required]);
      this.clearValidators(['cle_agence', 'cle_societe', 'first_name', 'last_name', 'nom_societe', 'adresse_societe', 'email_societe', 'telephone_societe']);
    }

    this.reserverForm.updateValueAndValidity();
  }

  clearValidators(fields: string[]): void {
    fields.forEach(field => {
      this.reserverForm.get(field)?.clearValidators();
      this.reserverForm.get(field)?.updateValueAndValidity();
    });
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

  Autocomplete() {
    const addressFields = [
      'adresse',
      'adresse_societe',
      'adresse_agence',
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

  genererNumeroReservation(): string {
    const anneeCourante = new Date().getFullYear();
    const timestamp = new Date().getTime().toString().slice(-4); // Les 4 derniers chiffres du timestamp pour unicité

    const formValues = this.form.value;
    const form = this.reserverForm.value;

    const lieuPriseEnCharge = (formValues.lieuxPriseEnCharge || '').substring(0, 2).toUpperCase();
    const lieuDestination = (formValues.lieuxDestination || '').substring(0, 2).toUpperCase();
    const clientId = form.client_selectionne || '00'; // ID ou identifiant unique du client
    const nombrePassager = form.nombrePassager || 0;
    const nombreBagage = this.capaciteChargement || 0;

    const numeroReservation = `${anneeCourante}R${clientId}${lieuPriseEnCharge}${lieuDestination}${nombrePassager}${nombreBagage}${timestamp}`;
    return numeroReservation;
  }


  // Valider la section
  sectionValider(nextCallback: any): void {
    // Vérifier si la validation a réussi pour passer à la section suivante
    const validationReussie = this.validerInformations();
    if (validationReussie) {
      // Passer à la section suivante
      this.valider = true;
      this.sectionValiderVisible = true;
      this.nextStep(nextCallback);
    } else {
      this.showError('Veuillez renseigner tous les champs obligatoires.');
    }
  }

  // Méthode pour valider les informations en fonction du type de client
  validerInformations(): boolean {
    if (this.clientType === 'ancien') {
      // Valider les informations pour un client ancien
      return this.validerClientAncien();
    } else if (this.clientType === 'nouveau') {
      // Valider les informations pour un nouveau client
      return this.validerNouveauClient();
    }
    return false; // Par défaut, la validation échoue
  }

  validerClientAncien(): boolean {
    const client_selectionne = this.reserverForm.get('client_selectionne')?.value;
    if (this.sontChampsRenseignes(client_selectionne)) {
      return true;
    } else {
      console.error('Les champs ne sont pas renseignés');
      return false;
    }
  }

  private sontChampsRenseignes(client_selectionne: number): boolean {
    this.recupererInformationsUtilisateur();
    return !!(client_selectionne);
  }

  private recupererInformationsUtilisateur(): void {
    this.ajouterDonneesReservation();
    this.recupererDetailsVehicule();
  }

  private ajouterDonneesReservation(): void {

    this.preRanplissage();
    const numeroReservationValue = this.genererNumeroReservation();
    const formValue = this.reserverForm.value;

    // Affichez les valeurs du formulaire pour vérifier leur état

    const notes = formValue.passengers.map((p: { name: any; phone: any; }) => ({
      type: 'passenger',
      content: `nom: ${p.name}, numero: ${p.phone}`
    }));

    if (formValue.note) {
      notes.push({ type: 'note', content: formValue.note });
    }

    this.reservationData = {
      numero_reservation: numeroReservationValue,
      datePriseEnCharge: formValue.datePriseEnCharge,
      dateRetour: formValue.dateRetour,
      coutTransport: formValue.coutTransport,
      coutMajorer: formValue.coutMajorer,
      lieuxPriseEnCharge: formValue.lieuxPriseEnCharge,
      lieuxDestination: formValue.lieuxDestination,
      distance: formValue.distance,
      duree: formValue.duree,
      typeReservation: formValue.typeReservation,
      vehicule: formValue.vehicule,
      distanceWaypoint: formValue.distanceWaypoint,
      dureeWaypoint: formValue.dureeWaypoint,
      destinationInputs: formValue.destinationInputs,
      attribut: formValue.attribut,
      coutTotalReservation: formValue.coutTotalReservation,
      totalAttributCost: formValue.totalAttributCost,
      nombreBagage: formValue.nombreBagage,
      nombrePassager: formValue.nombrePassager,
      compagnieAerienne: formValue.compagnieAerienne,
      modePaiement: formValue.modePaiement,
      lieu_rendez_vous: formValue.lieu_rendez_vous,
      statutReservation: formValue.statutReservation,
      numero_dossier: formValue.numero_dossier,
      utilisateur: formValue.client_selectionne,
      notes: notes, // Ajouter les notes et les passagers
      commission: formValue.commission,
      compensation: formValue.compensation,
      coutDeVente: formValue.coutDeVente,
    };

    // Affichez les données de réservation pour vérifier leur état
    this.cdr.detectChanges(); // Ajout ici
  }

  private recupererDetailsVehicule(): void {
    const vehicule = this.reserverForm.get('vehicule')?.value;

    this._estimationService.getVehiculeDetail(vehicule).subscribe(
      (vehicule: any) => {
        this.vehiculeData = vehicule;
        this.cdr.detectChanges(); // Ajout ici
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données du véhicule:', error);
      }
    );
  }

  preRanplissage() {
    const statutReservationValues = 'en_attente'
    const formValues = this.form.value;
    // Pré-remplissez les champs du formulaire de réservation
    this.reserverForm.patchValue({
      // Données à pré-remplir avec celles du formulaire principal
      datePriseEnCharge: formValues.datePriseEnCharge,
      dateRetour: formValues.dateRetour,
      coutTransport: formValues.coutTransport,
      coutMajorer: formValues.coutMajorer,
      lieuxPriseEnCharge: formValues.lieuxPriseEnCharge,
      lieuxDestination: formValues.lieuxDestination,
      distance: formValues.distParcourt,
      duree: formValues.durParcourt,
      typeReservation: formValues.typeVehicule,
      vehicule: formValues.vehicule,
      coutTotalReservation: formValues.coutTotalReservation,
      totalAttributCost: formValues.totalAttributCost,
      statutReservation: statutReservationValues,
    });
  }

  isValid(control: AbstractControl | null): boolean {
    return control ? control.valid : false;
  }

  checkClientDataValidity(typeClient: string): boolean {
    if (typeClient === 'client_simple' || typeClient === 'client_liee_agence' || typeClient === 'client_liee_societe') {
      return this.isValid(this.reserverForm.get('first_name')) &&
        this.isValid(this.reserverForm.get('last_name')) &&
        this.isValid(this.reserverForm.get('telephone')) &&
        this.isValid(this.reserverForm.get('adresse')) &&
        this.isValid(this.reserverForm.get('email'));
    } else if (typeClient === 'client_liee_agence') {
      return this.isValid(this.reserverForm.get('first_name')) &&
        this.isValid(this.reserverForm.get('last_name')) &&
        this.isValid(this.reserverForm.get('cle_agence')) &&
        this.isValid(this.reserverForm.get('telephone')) &&
        this.isValid(this.reserverForm.get('adresse')) &&
        this.isValid(this.reserverForm.get('email'));
    } else if (typeClient === 'client_liee_societe') {
      return this.isValid(this.reserverForm.get('first_name')) &&
        this.isValid(this.reserverForm.get('last_name')) &&
        this.isValid(this.reserverForm.get('cle_societe')) &&
        this.isValid(this.reserverForm.get('telephone')) &&
        this.isValid(this.reserverForm.get('adresse')) &&
        this.isValid(this.reserverForm.get('email'));
    } else if (typeClient === 'client_societe') {
      return this.isValid(this.reserverForm.get('nom_societe')) &&
        this.isValid(this.reserverForm.get('adresse_societe')) &&
        this.isValid(this.reserverForm.get('email_societe')) &&
        this.isValid(this.reserverForm.get('telephone_societe'));
    } else if (typeClient === 'client_agence') {
      return this.isValid(this.reserverForm.get('nom_agence')) &&
        this.isValid(this.reserverForm.get('adresse_agence')) &&
        this.isValid(this.reserverForm.get('email_agence')) &&
        this.isValid(this.reserverForm.get('telephone_agence'));
    }
    return false;
  }

  validerNouveauClient(): boolean {
    const typeClient = this.reserverForm.get('type_client')?.value;

    if (this.checkClientDataValidity(typeClient)) {
      const email = this.reserverForm.get('email')?.value;

      this._estimationService.registerUser(this.reserverForm.value).subscribe(
        (response) => {
          this.getClientsByEmailAndPrepareReservation(email);
        },
        (error: { status: number }) => {
          if (error.status === 400) {
            this.errorMessage = "Le nom ou l'adresse e-mail existe déjà.";
          } else {
            this.errorMessage = "Une erreur s'est produite lors de l'enregistrement du client.";
          }
          console.error('Erreur lors de l\'enregistrement du client:', error);
        }
      );
      return true;
    } else {
      console.error('Les champs ne sont pas renseignés ou invalides pour le type de client:', typeClient);
      return false;
    }
  }

  private getClientsByEmailAndPrepareReservation(data: any): void {
    this.preRanplissage();
    const numeroReservationValue = this.genererNumeroReservation();
    const formValue = this.reserverForm.value;

    const notes = formValue.passengers.map((p: { name: any; phone: any; }) => ({
      type: 'passenger',
      content: `nom: ${p.name}, numero: ${p.phone}`
    }));

    if (formValue.note) {
      notes.push({ type: 'note', content: formValue.note });
    }
    this.reservationData = {
      numero_reservation: numeroReservationValue,
      datePriseEnCharge: formValue.datePriseEnCharge,
      dateRetour: formValue.dateRetour,
      coutTransport: formValue.coutTransport,
      coutMajorer: formValue.coutMajorer,
      lieuxPriseEnCharge: formValue.lieuxPriseEnCharge,
      lieuxDestination: formValue.lieuxDestination,
      distance: formValue.distance,
      duree: formValue.duree,
      typeReservation: formValue.typeReservation,
      vehicule: formValue.vehicule,
      distanceWaypoint: formValue.distanceWaypoint,
      dureeWaypoint: formValue.dureeWaypoint,
      destinationInputs: formValue.destinationInputs,
      attribut: formValue.attribut,
      coutTotalReservation: formValue.coutTotalReservation,
      totalAttributCost: formValue.totalAttributCost,
      nombreBagage: formValue.nombreBagage,
      nombrePassager: formValue.nombrePassager,
      compagnieAerienne: formValue.compagnieAerienne,
      modePaiement: formValue.modePaiement,
      lieu_rendez_vous: formValue.lieu_rendez_vous,
      statutReservation: formValue.statutReservation,
      notes: notes // Ajouter les notes et les passagers
    };

    this.recupererDetailsVehicule();

    this._estimationService.getClients().subscribe((clients: any) => {
      const client = clients.clients.find((c: { email: string; }) => c.email === data);
      if (client) {
        this.reservationData['utilisateur'] = client.id;
        this.clientDetails = client;
        this.cdr.detectChanges(); // Ajout ici
      } else {
        console.error('Aucun client trouvé avec cet email');
      }
    },
      (error: any) => console.error('Erreur lors de la récupération des clients:', error));

    this.cdr.detectChanges();
  }

  onClientSelected(clientId: number): void {
    const selectedClient = this.clients.find((client: { id: number; }) => client.id === clientId);
    this.clientDetails = selectedClient;

  }

  // Méthode pour vérifier si le client est un client simple
  isSimpleClient(): boolean {
    const clientType = this.reserverForm.get('type_client')?.value;
    return clientType === 'client_simple';
  }

  // Méthode pour vérifier si le client est lié à une agence
  isLinkedToAgency(): boolean {
    const clientType = this.reserverForm.get('type_client')?.value;
    return clientType === 'client_liee_agence';
  }

  // Méthode pour vérifier si le client est lié à une société
  isLinkedToCompany(): boolean {
    const clientType = this.reserverForm.get('type_client')?.value;
    return clientType === 'client_liee_societe';
  }

  // Méthode pour vérifier si le client est un client société
  isCompanyClient(): boolean {
    const clientType = this.reserverForm.get('type_client')?.value;
    return clientType === 'client_societe';
  }

  // Méthode pour vérifier si le client est un client agence
  isAgencyClient(): boolean {
    const clientType = this.reserverForm.get('type_client')?.value;
    return clientType === 'client_agence';
  }


  reservation() {
    console.log('this.reservationData', this.reservationData);
    console.log('this.reserverForm', this.reserverForm.value)

  }

  async reserver(): Promise<void> {
    this.startLoading();
    try {
      await this._estimationService.addReservation(this.reservationData).toPromise();
      console.log('Reservation successful');
      this.handleSuccess();
    } catch (error) {
      console.error('Reservation failed', error);
      this.handleError(error);
    }
  }

  startLoading(): void {
    this.loading = true;
    this.cdr.detectChanges(); // Ensure change detection runs for loading spinner
  }

  stopLoading(): void {
    this.loading = false;
    this.cdr.detectChanges(); // Ensure change detection runs after stopping loading spinner
  }

  handleSuccess(): void {
    this.stopLoading();
    this.successMessage = 'Réservation enregistrée avec succès. Un e-mail a été envoyé au client.';
    this.showSuccess(this.successMessage);
    this.router.navigate(['/app/reservations']);
  }

  handleError(error: any): void {
    this.stopLoading();
    this.errorMessage = 'Erreur lors de l\'enregistrement de la réservation: ' + error;
    this.showError(this.errorMessage);
  }

  compensationEnabled: boolean = false;
  isCommissionByAmount: boolean = false;

  appliquerCommission() {
    this.compensationEnabled = false;
    this.reserverForm.get('commission')?.setValue(10); // Réinitialiser la commission à 10% par défaut
  }

  compenserCourse() {
    this.compensationEnabled = true;
    this.reserverForm.get('compensation')?.reset(); // Réinitialiser la compensation
  }

  calculate() {
    this.isCalculating = true;

    const coutTotalReservation = this.coutTotalReservation;
    if (this.compensationEnabled) {
      const compensation = this.reserverForm.value.compensation;
      const coutDeVente = coutTotalReservation + compensation;

      this.reserverForm.patchValue({
        coutDeVente: coutDeVente,
        commission: 0
      }, { emitEvent: false });

    } else {
      let coutDeVente;

      if (this.isCommissionByAmount) {
        const commissionAmount = this.reserverForm.value.commissionAmount;
        let commissionPercentage = (commissionAmount / coutTotalReservation) * 100;
        commissionPercentage = parseFloat(commissionPercentage.toFixed(1));
        this.reserverForm.get('commission')?.setValue(commissionPercentage, { emitEvent: false });
        coutDeVente = coutTotalReservation - commissionAmount;
      } else {
        const commission = coutTotalReservation * (this.reserverForm.value.commission / 100);
        coutDeVente = coutTotalReservation - commission;
      }

      this.reserverForm.patchValue({
        coutDeVente: coutDeVente,
        compensation: 0
      }, { emitEvent: false });
    }
    this.isCalculating = false;

    this.cdr.detectChanges();
  }

  toggleCommissionInput() {
    this.isCommissionByAmount = !this.isCommissionByAmount;
  }

  isContentVisible = false;

  toggleVisibility() {
    this.isContentVisible = !this.isContentVisible;
  }
}
