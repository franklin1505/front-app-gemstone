import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckboxChangeEvent } from 'primeng/checkbox';

@Component({
  selector: 'app-generer-facture',
  templateUrl: './generer-facture.component.html',
  styleUrls: ['./generer-facture.component.css']
})
export class GenererFactureComponent implements OnInit {
  breadcrumbItems: MenuItem[] = [];
  reservationIds: number[] = [];
  reservations: any[] = [];
  reservationsSansFacture: any[] = []; // Les réservations sans facture à afficher dans le modal
  utilisateurId!: number;
  clientDetails: any;
  selectedReservationsSansFacture: any[] = [];
  message: any;
  tauxTVA = 0.1;
  errorMessage = '';
  successMessage = '';
  nombreReservations: number = 0;
  coutTotal: number = 0;
  coutHorsTaxes: number = 0;
  tva: number = 0;
  loading: boolean = false;
  ConfigInfoList: any;
  entrepriseList: any;
  previsualisationFacture: boolean = false;
  courseEnCours: boolean = false;
  factureForm: FormGroup;
  estValide: boolean[] = [];
  isPartiel: any;
  visible: boolean = false;
  isContent: boolean = false;

  @HostListener('window:beforeunload', ['$event'])
  intercepteRafraichissement($event: any): void {
    if (this.courseEnCours) {
      $event.returnValue = true;
    }
  }

  constructor(
    private fb: FormBuilder,
    private reservationService: CrmService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
  ) {
    const today = new Date();
    const formattedToday = today.toISOString().substring(0, 16);

    // Calcul de la date d'échéance par défaut (30 jours après aujourd'hui)
    const defaultEcheanceDate = new Date(today);
    defaultEcheanceDate.setDate(defaultEcheanceDate.getDate() + 30);
    const formattedEcheanceDate = defaultEcheanceDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

    this.factureForm = this.fb.group({
      dateEmission: [{ value: formattedToday, disabled: true }],
      totalHT: [0, [Validators.required]],
      totalTVA: [0, [Validators.required]],
      totalTTC: [0, [Validators.required]],
      statutPaiement: ['impaye', [Validators.required]], // Exemple avec une valeur par défaut
      donneesSupplementaires: this.fb.array([]),
      methodePaiement: ['Virement Bancaire', [Validators.required]],
      notesInternes: [
        'Ce fut un plaisir de travailler avec vous. Nous espérons que vous nous garderez à l’esprit pour vos futurs trajets. Merci!',
      ],
      dateEcheance: [formattedEcheanceDate, [Validators.required]], // Date d'échéance par défaut à 30 jours
      utilisateurId: null,
      isPartiel: false,
      reservations: null,
    });
  }
  ngOnInit(): void {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Facture' });
    this.breadcrumbItems.push({ label: 'Généré Facture' });
    this.getUser();

    this.reservationIds = this.reservationService.getReservationIds();
    if (this.reservationIds.length > 0) {
      this.chargerDetailsReservations(this.reservationIds);
    } else {
      console.log('Aucune réservation sélectionnée.');
    }
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/factures']);
  }

  getUser() {
    const userInfo = this.reservationService.getUserId()
    if (userInfo !== null) {
      const userInfoAsInt = parseInt(userInfo, 10);

      if (!isNaN(userInfoAsInt)) {
        this.getEntreprise(userInfoAsInt);
      } else {
        console.error('userInfo is not a valid number');
      }
    } else {
      console.error('userInfo is null');
    }
  }

  getEntreprise(userInfo:any): void {
    this.reservationService.getEntreprises().subscribe((data: any[]) => {
      // Filtrer les entreprises par type "Mon_Entreprise" et utilisateur connecté
      console.log('data',data)
      this.entrepriseList = data.filter((entreprise) => {
        return (
          entreprise.type_entreprise === 'mon_entreprise' &&
          entreprise.utilisateur === userInfo
        );
      });
      console.log('this.entrepriseList',this.entrepriseList)
    });
  }

  getLogoUrl(logoFileName: string): string {
    if (logoFileName) {
      // Utilisez le chemin vers le dossier des logos sur votre serveur Django.
      return logoFileName;
    } else {
      // Utilisez un chemin local vers une image par défaut.
      return '/assets/img/logo.jpg';
    }
  }

  chargerDetailsReservations(reservationIds: any): void {
    this.courseEnCours = true;
    this.reservationService.getReservationsByIds(reservationIds).subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        if (reservations.length > 0) {
          let usr = reservations[0].utilisateur;
          this.clientDetails = usr
          this.utilisateurId = usr.id
          this.chargerReservationsSansFacture();
          this.calculerCouts();
        }
        // Ici, vous pouvez traiter les données reçues comme nécessaire
      },
      error: (error) => {
        console.error(
          'Erreur lors de la récupération des détails des réservations',
          error
        );
        // Gérer l'erreur
      },
    });
  }



  openModal(type: 'visible' | 'content') {
    switch (type) {

      case 'visible':
        this.visible = true;
        break;

      case 'content':
        this.isContent = true;
        break;

    }
  }

  toggleSelection(reservation: any, event: CheckboxChangeEvent): void {
    if (event.checked) {
      if (!this.selectedReservationsSansFacture.some((r) => r.id === reservation.id)) {
        this.selectedReservationsSansFacture.push(reservation);
      } else {
        this.message = 'Cette réservation est déjà sélectionnée pour la facture.';
        this.showError(this.message);
        event.originalEvent?.preventDefault();  // Pour empêcher le changement de l'état de la case à cocher
      }
    } else {
      this.selectedReservationsSansFacture = this.selectedReservationsSansFacture.filter(
        (r) => r.id !== reservation.id
      );
    }
  }

  ajouterSelectionsAuFacture(): void {
    if (this.selectedReservationsSansFacture.length > 0) {
      this.reservations = [
        ...this.reservations,
        ...this.selectedReservationsSansFacture,
      ];
      console.log(this.reservations);
      this.calculerCouts();
      this.isContent = false
    } else {
      /*       this.modalService.open(content, { centered: true }); */
      this.message = 'Veuillez sélectionner au moins une réservation.';
      this.showSuccess(this.message)
    }
  }



  calculerCouts(): void {
    // Calcul basé sur les réservations
    this.nombreReservations = this.reservations.length;
    let coutTotalReservations = this.reservations.reduce(
      (acc, reservation) => acc + reservation.coutTotalReservation,
      0
    );

    // Récupération et somme des totaux TTC des données supplémentaires
    let coutTotalSupplementairesTTC =
      this.donneesSupplementaires.controls.reduce((acc, donnee) => {
        return acc + donnee.get('totalTTC')?.value || 0;
      }, 0);

    // Calcul du coût total TTC (réservations + données supplémentaires)
    this.coutTotal = parseFloat(
      (coutTotalReservations + coutTotalSupplementairesTTC).toFixed(2)
    );

    // Supposons que le taux de TVA est de 10% pour simplifier
    let baseCalculTVA = 1.1; // 1 + (10% de TVA)

    // Calcul du coût HT et de la TVA sur la base du total TTC
    this.coutHorsTaxes = parseFloat(
      (this.coutTotal / baseCalculTVA).toFixed(2)
    );
    this.tva = parseFloat((this.coutTotal - this.coutHorsTaxes).toFixed(2));
    this.initialiserDonneesFormulaire();
  }

  chargerReservationsSansFacture(): void {
    this.reservationService
      .getReservationsSansFacture(this.utilisateurId).subscribe({
        next: (reservationsSansFacture) => {
          this.reservationsSansFacture = reservationsSansFacture;
          console.log(reservationsSansFacture);
        },
        error: (error) => {
          console.error(
            'Erreur lors de la récupération des réservations sans facture',
            error
          );
        },
      });
  }


  afficherPrevisualisationFacture() {
    this.previsualisationFacture = !this.previsualisationFacture;
  }

  retirerReservation(id: number): void {
    // Filtrer la liste des réservations pour retirer celle dont l'ID correspond
    this.reservations = this.reservations.filter(
      (reservation) => reservation.id !== id
    );
    // Optionnel : Si vous maintenez une liste d'IDs sélectionnés pour une logique ultérieure,
    // assurez-vous également de retirer l'ID de cette liste.
    this.reservationIds = this.reservationIds.filter(
      (reservationId) => reservationId !== id
    );

    // Mettre à jour la liste d'IDs sélectionnés dans le service si nécessaire
    this.reservationService.setReservationIds(this.reservationIds);

    // Recalculer les coûts et mettre à jour les détails de la facture
    this.calculerCouts();
  }


  get donneesSupplementaires(): FormArray {
    return this.factureForm.get('donneesSupplementaires') as FormArray;
  }

  ajouterDonneeSupplementaire(): void {
    const donneeSupplementaire = this.fb.group({
      item: ['', Validators.required],
      description: ['', Validators.required],
      prixUnitaireHT: [0, [Validators.required, Validators.min(1)]],
      quantite: [1, [Validators.required, Validators.min(1)]],
      tva: [0.1, [Validators.required, Validators.min(0)]], // TVA en décimale
      totalTTC: [{ value: 0, disabled: true }],
    });

    this.donneesSupplementaires.push(donneeSupplementaire);
    // Souscrire aux changements pour mettre à jour le total TTC
    donneeSupplementaire
      .get('prixUnitaireHT')
      ?.valueChanges.subscribe((val) =>
        this.mettreAJourTotalTTC(donneeSupplementaire)
      );
    donneeSupplementaire
      .get('quantite')
      ?.valueChanges.subscribe((val) =>
        this.mettreAJourTotalTTC(donneeSupplementaire)
      );
    donneeSupplementaire
      .get('tva')
      ?.valueChanges.subscribe((val) =>
        this.mettreAJourTotalTTC(donneeSupplementaire)
      );
    this.estValide.push(false); // Marque le nouvel élément comme non validé
  }

  mettreAJourTotalTTC(donneeSupplementaire: FormGroup): void {
    const prixUnitaireHT = donneeSupplementaire.get('prixUnitaireHT')?.value;
    const quantite = donneeSupplementaire.get('quantite')?.value;
    const tva = donneeSupplementaire.get('tva')?.value;
    const totalTTC = prixUnitaireHT * (1 + tva) * quantite;

    donneeSupplementaire
      .get('totalTTC')
      ?.setValue(totalTTC, { emitEvent: false });
  }

  supprimerDonneeSupplementaire(index: number): void {
    this.donneesSupplementaires.removeAt(index);
    this.estValide.splice(index, 1); // Met à jour le tableau des états de validation
    this.calculerCouts(); // Recalculer les coûts après la suppression
  }

  validerElement(index: number): void {
    const element = this.donneesSupplementaires.at(index);

    if (element.valid) {
      this.estValide[index] = true;
      this.calculerCouts();
    } else {
      this.showError('Veuillez remplir tous les champs avant de valider.')
      element.markAllAsTouched();
    }
  }
  initialiserDonneesFormulaire(): void {
    // Assurez-vous que les données nécessaires sont déjà chargées ou calculées
    this.factureForm.patchValue({
      reservations: this.reservationIds,
      totalHT: this.coutHorsTaxes,
      utilisateurId: this.utilisateurId,
      isPartiel: this.isPartiel,
      totalTVA: this.tva,
      totalTTC: this.coutTotal,
      // Autres champs peuvent être ajoutés ici si nécessaire
    });

    // Si vous voulez également ajouter des données supplémentaires dynamiquement, assurez-vous de les traiter ici
  }

  get isDateEcheanceSet(): boolean {
    return !!this.factureForm.get('dateEcheance')?.value;
  }

  get isTouteDonneeSupplementaireValidee(): boolean {
    // Vérifie si chaque donnée supplémentaire est validée
    return !this.estValide.includes(false);
  }

  get peutSoumettre(): boolean {
    // Conditions pour permettre la soumission
    return this.isDateEcheanceSet && this.isTouteDonneeSupplementaireValidee;
  }

  soumettreFacture(): void {
    this.courseEnCours = false;

    if (!this.peutSoumettre) {
      console.error("Le formulaire n'est pas prêt pour la soumission.");
      return;
    }

    // Préparation des données de la facture pour la soumission
    const donneesFacture = {
      ...this.factureForm.value,
      dateEcheance: this.factureForm.get('dateEcheance')?.value, // Pour obtenir la valeur même si elle est désactivée
      donneesSupplementaires: this.donneesSupplementaires.value, // Assurez-vous que cela ne contient que des données validées
    };

    this.loading = true;
    console.log(donneesFacture);

    setTimeout(() => {
      this.reservationService.creerFacture(donneesFacture).subscribe({
        next: (response) => {
          console.log('Facture créée avec succès', response);
          this.loading = false;
          this.successMessage = 'Votre facture a été générée avec succès';
          this.showSuccess(this.successMessage);

          // Redirection vers le tableau de bord des factures après la création réussie
          this.router.navigate(['/app/factures']);
        },
        error: (error) => {
          console.error('Erreur lors de la création de la facture', error);
          this.loading = false;
          this.errorMessage = 'Une erreur est survenue lors de la création de la facture';
          this.showError(this.errorMessage);
        },
      });
    }, 2000);
  }


  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  paymentOptions = [
    { label: 'Payable dès réception', value: '0' },
    { label: 'Paiement sous 15 jours', value: '15' },
    { label: 'Paiement sous 30 jours', value: '30' },
    { label: 'Paiement sous 45 jours', value: '45' },
    { label: 'Paiement sous 60 jours', value: '60' },
    { label: 'Personnaliser', value: 'custom' }
  ];

  selectedPaymentOption: string = '30'; // Valeur par défaut de 30 jours
  customDays: number = 0;
  isCustomOptionSelected: boolean = false;

  setPaymentOption(event: any) {
    const selectedValue = event.value;
    if (selectedValue === 'custom') {
      this.isCustomOptionSelected = true;
      this.customDays = 0; // Réinitialiser le champ de personnalisation
    } else {
      this.isCustomOptionSelected = false;
      const daysToAdd = parseInt(selectedValue, 10);
      this.updateDateEcheance(daysToAdd);
    }
  }

  setCustomDays(days: number) {
    if (days > 0) {
      this.updateDateEcheance(days);
    }
  }

  updateDateEcheance(daysToAdd: number) {
    const dateEmissionValue = this.factureForm.get('dateEmission')?.value;

    if (dateEmissionValue) {
      const dateEmission = new Date(dateEmissionValue);

      if (!isNaN(dateEmission.getTime())) { // Vérifie si la date est valide
        const dateEcheance = new Date(dateEmission);
        dateEcheance.setDate(dateEcheance.getDate() + daysToAdd);

        this.factureForm.patchValue({
          dateEcheance: dateEcheance.toISOString().split('T')[0] // Format YYYY-MM-DD
        });
      } else {
        console.error("Date d'émission invalide:", dateEmissionValue);
        // Affichez un message d'erreur à l'utilisateur si la date est invalide
      }
    } else {
      console.error("Date d'émission est manquante");
      // Affichez un message d'erreur à l'utilisateur si la date est manquante
    }
  }

}
