import { Component, OnInit } from '@angular/core';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
  selector: 'app-gestion-factures',
  templateUrl: './gestion-factures.component.html',
  styleUrls: ['./gestion-factures.component.css']
})
export class GestionFacturesComponent implements OnInit {
  confirmationDialogVisible: boolean = false;
  actionType: string = '';
  nombreReservations: number = 0;
  coutTotal: number = 0;
  coutHorsTaxes: number = 0;
  tva: number = 0;
  selectedMainCardType = "";
  sendData: boolean = false;
  factureId: any;
  factures: any;
  entrepriseList: any;
  tauxTVA = 0.1;
  loading: boolean = false;
  successMessage = "";
  errorMessage = "";
  email = "";
  form!: FormGroup;
  breadcrumbItems: MenuItem[] = [];
  partielDialogVisible: boolean = false; // Visibilité du dialog pour le paiement partiel
  sommePayee: number = 0; // Somme payée
  factureTotalTTC: number = 0; // Total TTC de la facture
  dateEmission!: Date;
  displayConfirmationClient = false;
  displayConfirmationOther = false;
  confirmingOtherEmail = false;
  otherEmail: any;
  clientEmail: any;
  selectedMethod: string = '';
  paymentOptions = [
    { label: 'Payable dès réception', value: '0' },
    { label: 'Paiement sous 15 jours', value: '15' },
    { label: 'Paiement sous 30 jours', value: '30' },
    { label: 'Paiement sous 45 jours', value: '45' },
    { label: 'Paiement sous 60 jours', value: '60' },
    { label: 'Personnaliser', value: 'custom' }
  ];

  displayDialog: boolean = false;
  displayDateDialog: boolean = false;
  selectedPaymentOption: string = '30'; // Default value for 30 days
  customDays: number = 0;
  isCustomOptionSelected: boolean = false;
  userType:any
  paymentMethods = [
    { label: 'PayPal', value: 'PayPal' },
    { label: 'Virement Bancaire', value: 'Virement Bancaire' },
    { label: 'Stripe', value: 'Stripe' },
    { label: 'Espèce', value: 'Espèce' },
    { label: 'Cryptomonnaie', value: 'Cryptomonnaie' },
    { label: 'Autre', value: 'Autre' },
  ];

  constructor(
    private _factureService: CrmService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Facture' });
    this.breadcrumbItems.push({ label: 'Détails' });
    this.route.params.subscribe((params) => {
      this.factureId = +params["id"]; // Assurez-vous que 'id' correspond à l'ID de la réservation dans vos routes
    });
    this.FactureDetails(this.factureId);
    this.userType = this._factureService.getUserType();

  }

  FactureDetails(id: any) {
    this._factureService.getFacture(id).subscribe((facture) => {
      this.factures = facture;
      this.selectedMethod = facture.methodePaiement;
      this.selectedPaymentOption = this.getPaymentOptionFromEcheance(facture.dateEcheance);
      this.dateEmission = new Date(facture.dateEmission);
    });
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/factures']);
  }


  shareMenuItems = [
    {
      label: 'Télécharger le PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.generatePDF()
    },
    {
      label: 'Partager par Email',
      icon: 'pi pi-envelope',
      items: [
        { label: 'Envoyer au client', command: () => this.showConfirmationDialog('client') },
        { label: 'Envoyer à Autre', command: () => this.showConfirmationDialog('other') }
      ]
    }
  ];

  showConfirmationDialog(type: string) {
    if (type === 'client') {
      this.displayConfirmationClient = true;
      this.clientEmail = this.factures.client?.email
    } else if (type === 'other') {
      this.displayConfirmationOther = true;
      this.confirmingOtherEmail = false;
      this.otherEmail = '';
    }
  }

  generatePDF(): void {
    if (this.factureId) {
      this._factureService.downloadFacturePdf(this.factureId);
    }
  }

  confirmOtherEmail() {
    if (this.otherEmail) {
      this.confirmingOtherEmail = true;
    }
  }

  confirmSendEmail(typePersonne: string) {
    this.loading = true;
    const email = typePersonne === 'mailClient' ? null : this.otherEmail;

    setTimeout(() => {
      this.sendFactureEmail(this.factureId, typePersonne, email).subscribe(
        () => {
          this.loading = false;
          this.showSuccess('Email envoyé avec succès.')
          this.closeDialogs();
        },
        () => {
          this.loading = false;
          this.showError('Échec de l\'envoi de l\'email.')
          this.closeDialogs();
        }
      );
    }, 1500);
  }

  sendFactureEmail(factureId: number, typePersonne: string, email?: string) {
    return this._factureService.sendFactureEmail(factureId, typePersonne, email);
  }

  closeDialogs() {
    this.displayConfirmationClient = false;
    this.displayConfirmationOther = false;
  }


  editMenuItems = [
    { label: "Modifier la date d'échéance", icon: 'pi pi-calendar', command: () => this.openDateDialog() },
    { label: 'Modifier le mode de paiement', icon: 'pi pi-credit-card', command: () => this.openPaymentMethodDialog() },
    { label: 'Ajouter une réservation', icon: 'pi pi-plus' },
    { label: 'Ajouter des informations complémentaires', icon: 'pi pi-database' }
  ];

  openPaymentMethodDialog() {
    this.displayDialog = true;
  }

  openDateDialog() {
    this.displayDateDialog = true;
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  confirmAction(type: string) {
    this.actionType = type;
    this.confirmationDialogVisible = true;
  }

  executeAction() {
    this.loading = true;

    let nouveauType = '';
    if (this.actionType === 'annuler') {
      nouveauType = 'annule';
    } else if (this.actionType === 'restaurer') {
      nouveauType = 'non_regler';
    } else if (this.actionType === 'regler') {
      nouveauType = 'regler';
    }

    setTimeout(() => {
      this._factureService.changerTypeFacture(this.factureId, nouveauType).subscribe(
        (response) => {
          this.loading = false;
          this.showSuccess(response.message);
          this.FactureDetails(this.factureId); // Recharger les détails de la facture
        },
        (error) => {
          this.loading = false;
          this.showError(error.error);
          console.error(error)
        }
      );
    }, 1500);
  }

  openPartielDialog() {
    this.sommePayee = 0; // Réinitialiser la somme payée
    this.partielDialogVisible = true;
  }


  submitPartielPayment() {
    if ((this.factures.resteAPayer === 0 && (this.sommePayee <= 0 || this.sommePayee > this.factures.totalTTC)) ||
      (this.factures.resteAPayer > 0 && (this.sommePayee <= 0 || this.sommePayee > this.factures.resteAPayer))) {
      this.showError('Veuillez saisir une somme valide.');
      return;
    }


    this.loading = true;
    const nouveauType = this.sommePayee === this.factures.resteAPayer ? 'regler' : 'partiement_regler';

    setTimeout(() => {
      const request = nouveauType === 'regler'
        ? this._factureService.changerTypeFacture(this.factureId, nouveauType)  // Sans sommePayee
        : this._factureService.changerTypeFacture(this.factureId, nouveauType, this.sommePayee);  // Avec sommePayee

      request.subscribe(
        (response) => {
          this.loading = false;
          this.showSuccess(response.message);
          this.FactureDetails(this.factureId);
          this.partielDialogVisible = false;
        },
        (error) => {
          this.loading = false;
          this.showError(error.error);
          console.error(error);
        }
      );
    }, 1500);
  }


  updatePaymentMethod() {
    this.loading = true;
    const updateData = { methodePaiement: this.selectedMethod };

    // Simulate a delay for the loading effect
    setTimeout(() => {
      this._factureService.updateFacturePartial(this.factureId, updateData).subscribe(
        (response) => {
          this.showSuccess('Méthode de paiement mise à jour avec succès');
          this.loading = false;
          this.FactureDetails(this.factureId)
        },
        (error) => {
          this.showError("Échec de la mise à jour de la méthode de paiement");
          this.loading = false;
          console.log(error)
        }
      );
    }, 1500);
  }


  // Determine payment option from dateEcheance
  getPaymentOptionFromEcheance(dateEcheance: string): string {
    const now = new Date();
    const echeanceDate = new Date(dateEcheance);
    const diffTime = Math.abs(echeanceDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const paymentOption = this.paymentOptions.find(option => option.value === diffDays.toString());
    return paymentOption ? paymentOption.value : 'custom';
  }

  // Set the payment option (this doesn't update the date yet)
  setPaymentOption(event: any) {
    const selectedValue = event.value;
    if (selectedValue === 'custom') {
      this.isCustomOptionSelected = true;
      this.customDays = 0;  // Reset custom days
    } else {
      this.isCustomOptionSelected = false;
      this.customDays = parseInt(selectedValue, 10);
    }
  }

  // Set custom days for échéance (this doesn't update the date yet)
  setCustomDays(days: number) {
    if (days > 0) {
      this.customDays = days;
    }
  }

  // Validate the selected payment option or custom days, then update
  validateDateEcheance() {
    let daysToAdd: number;

    // If custom option is selected, use customDays, otherwise use selectedPaymentOption
    if (this.isCustomOptionSelected && this.customDays > 0) {
      daysToAdd = this.customDays;
    } else {
      daysToAdd = parseInt(this.selectedPaymentOption, 10);
    }

    // Check if the daysToAdd is valid, then call updateDateEcheance
    if (daysToAdd > 0) {
      this.updateDateEcheance(daysToAdd);
    } else {
      this.showError("Veuillez sélectionner une option de paiement valide.");
    }
  }

  // Update date d'échéance based on the number of days added to dateEmission
  updateDateEcheance(daysToAdd: number) {
    if (!isNaN(this.dateEmission.getTime())) {
      const dateEcheance = new Date(this.dateEmission);  // Use dateEmission, not current date
      dateEcheance.setDate(dateEcheance.getDate() + daysToAdd);  // Add the selected number of days

      // Call the method to submit the update to the backend
      this.submitDateEcheanceUpdate(dateEcheance);
    } else {
      this.showError("Date d'émission est invalide ou manquante");
    }
  }

  // Submit the updated date to the server
  submitDateEcheanceUpdate(dateEcheance: Date) {
    this.loading = true;
    const updateData = { dateEcheance: dateEcheance.toISOString().split('T')[0] };

    // Simulate API call and loading
    setTimeout(() => {
      this._factureService.updateFacturePartial(this.factureId, updateData).subscribe(
        (response) => {
          this.showSuccess('Date d\'échéance mise à jour avec succès');
          this.loading = false;
          this.displayDateDialog = false;  // Close dialog on success
          this.FactureDetails(this.factureId)
        },
        (error) => {
          this.showError("Échec de la mise à jour de la date d'échéance");
          this.loading = false;
        }
      );
    }, 1500);
  }

}
