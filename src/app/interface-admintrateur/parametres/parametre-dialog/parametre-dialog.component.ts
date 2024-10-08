import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { MessageService } from 'primeng/api';

declare var google: any;

@Component({
  selector: 'app-parametre-dialog',
  templateUrl: './parametre-dialog.component.html',
  styleUrls: ['./parametre-dialog.component.css']
})
export class ParametreDialogComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() parametres: any = null;
  @Input() type: string = '';
  @Output() onClose = new EventEmitter<void>();

  @Input() visiblePartenaire: boolean = false; // Input for dialog visibility
  @Output() visiblePartenaireChange = new EventEmitter<boolean>(); // Output for two-way binding
  @Output() close = new EventEmitter<void>(); // Output to notify parent component when the dialog is closed
  @Input() entreprise: any | null = null


  entrepriseList: any[] = [];
  parametresForm: FormGroup;
  type_utilisateur: any;

  constructor(private fb: FormBuilder, private parametresService: CrmService, private messageService: MessageService) {
    this.parametresForm = this.fb.group({
      // Champs pour les différents types de paramètres
      valeur_cle_api: [''],
      url_operateur: [''],
      url_partenaire: [''],
      pass_standard: [''],
      pass_admin: [''],
      smtp_server: [''],
      email_host_user: ['', Validators.email],
      email_host_password: [''],
      text_introductif: [''],
      pied_page_defaut: [''],
      condition_general: [''],
      condition_reglement_defaut: [''],
      interet_retard: [''],
      nom_attribut: [''],
      prix_unitaire_attribut: [''],
      nombre_maximum: [''],
      nom_type: [''],
      description: [''],
      client_id: [''],
      client_secret: [''],
      api_url: ['https://api.sandbox.paypal.com'],
      banque: [''],
      iban: [''],
      bic: [''],
      titulaire: [''],
      entreprise: [''],
      libelleCompte: [''],
      nom: [''],
      // Champs pour le service client
      email: [''],
      telephone: [''],
      adresse: [''],
      horaires_ouverture: ['']
    });

  }

  ngOnInit(): void {
    this.adjustFormFields();
    this.getEntreprise();
  }

  getEntreprise(): void {
    this.parametresService.getEntreprises().subscribe((data: any[]) => {
      this.entrepriseList = data;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.adjustFormFields();
    if (changes['parametres'] && changes['parametres'].currentValue) {
      this.parametresForm.patchValue(this.parametres);
    }
  }

  adjustFormFields() {
    // Réinitialiser tous les champs et les désactiver
    this.parametresForm.reset();
    Object.keys(this.parametresForm.controls).forEach(control => {
      this.parametresForm.get(control)?.disable();
    });
    // Activer uniquement les champs pertinents en fonction du type
    const fieldsToEnable = this.getRelevantFields();
    fieldsToEnable.forEach(field => this.parametresForm.get(field)?.enable());
  }

  getRelevantFields(): string[] {
    switch (this.type) {
      case 'facture':
      case 'devis':
        return ['text_introductif', 'pied_page_defaut', 'condition_general', 'condition_reglement_defaut', 'interet_retard'];
      case 'api':
        return ['valeur_cle_api'];
      case 'url':
        return ['url_operateur', 'url_partenaire'];
      case 'code':
        return ['pass_standard', 'pass_admin'];
      case 'email':
        return ['smtp_server', 'email_host_user', 'email_host_password'];
      case 'attribut':
        return ['nom_attribut', 'prix_unitaire_attribut', 'nombre_maximum', 'entreprise'];
      case 'type_vehicule':
        return ['nom_type', 'description'];
      case 'methode':
        return ['nom', 'description'];
      case 'paypal':
        return ['client_id', 'client_secret', 'api_url'];
      case 'virement_bancaire':
        return ['banque', 'iban', 'bic', 'titulaire', 'libelleCompte'];
      case 'service_client':  // Nouveau cas pour le service client
        return ['email', 'telephone', 'adresse', 'horaires_ouverture'];
      default:
        return [];
    }
  }

  onSubmit() {
    if (this.parametresForm.valid) {
      switch (this.type) {
        case 'facture':
          this.handleFactureSubmit();
          break;
        case 'devis':
          this.handleDevisSubmit();
          break;
        case 'api':
          this.handleApiSubmit();
          break;
        case 'url':
          this.handleUrlSubmit();
          break;
        case 'code':
          this.handleCodeSubmit();
          break;
        case 'email':
          this.handleEmailSubmit();
          break;
        case 'attribut':
          this.handleAttributSubmit();
          break;
        case 'methode':
          this.handleMethodeSubmit();
          break;
        case 'type_vehicule':
          this.handleTypeVehiculeSubmit();
          break;
        case 'paypal':
          this.handlePaypalSubmit();
          break;
        case 'virement_bancaire':
          this.handleVirementBancaireSubmit();
          break;
        case 'service_client':  // Nouveau cas pour le service client
          this.handleServiceClientSubmit();
          break;
        default:
          break;
      }
    }
  }

  handleServiceClientSubmit() {
    if (this.parametres) {
      this.parametresService.updateServiceClient(this.parametres.id, this.parametresForm.value).subscribe(
        () => this.handleSuccess('Service client mis à jour avec succès'),
        () => this.showError('Erreur lors de la mise à jour du service client')
      );
    } else {
      this.parametresService.addServiceClient(this.parametresForm.value).subscribe(
        () => this.handleSuccess('Service client ajouté avec succès'),
        () => this.showError('Erreur lors de l\'ajout du service client')
      );
    }
  }


  handleApiSubmit() {
    if (this.parametres) {
      this.parametresService.updateApi(this.parametres.id, this.parametresForm.value).subscribe(
        () => this.handleSuccess('Clé API mise à jour avec succès'),
        () => this.showError('Erreur lors de la mise à jour de la clé API')
      );
    } else {
      this.parametresService.addApi(this.parametresForm.value).subscribe(
        () => this.handleSuccess('Clé API ajoutée avec succès'),
        () => this.showError('Erreur lors de l\'ajout de la clé API')
      );
    }
  }


  handleMethodeSubmit() {
    if (this.parametres) {
      this.parametresService.updateMethode(this.parametres.id, this.parametresForm.value).subscribe(
        () => this.handleSuccess('Méthode de paiement mise à jour avec succès'),
        () => this.showError('Erreur lors de la mise à jour de la méthode de paiement ')
      );
    } else {
      this.parametresService.addMethode(this.parametresForm.value).subscribe(
        () => this.handleSuccess('Méthode de paiement  ajoutée avec succès'),
        () => this.showError('Erreur lors de l\'ajout de la méthode de paiement ')
      );
    }
  }

  handleFactureSubmit() {
    if (this.parametres) {
      this.parametresService.updateConfigFacture(this.parametres.id, this.parametresForm.value).subscribe(
        () => this.handleSuccess('Configuration de facture mise à jour avec succès.'),
        () => this.showError('Erreur lors de la mise à jour des configurations de facture')
      );
    } else {
      this.parametresService.addConfigFacture(this.parametresForm.value).subscribe(
        () => this.handleSuccess('Configuration de facture ajoutée avec succès'),
        () => this.showError('Erreur lors de l\'ajout de la Configuration de facture')
      );
    }
  }

  handleDevisSubmit() {
    if (this.parametres) {
      this.parametresService.updateConfigDevis(this.parametres.id, this.parametresForm.value).subscribe(
        () => this.handleSuccess('Configuration de devis mise à jour avec succès.'),
        () => this.showError('Erreur lors de la mise à jour de la Configuration de devis')
      );
    } else {
      this.parametresService.addConfigDevis(this.parametresForm.value).subscribe(
        () => this.handleSuccess('Configuration de devis ajoutée avec succès'),
        () => this.showError('Erreur lors de l\'ajout de la Configuration de devis')
      );
    }
  }

  handleUrlSubmit() {
    if (this.parametres) {
      this.parametresService.updateUrl(this.parametres.id, this.parametresForm.value).subscribe(
        () => this.handleSuccess('URL mise à jour avec succès'),
        () => this.showError('Erreur lors de la mise à jour de l\'URL')
      );
    } else {
      this.parametresService.addUrl(this.parametresForm.value).subscribe(
        () => this.handleSuccess('URL ajoutée avec succès'),
        () => this.showError('Erreur lors de l\'ajout de l\'URL')
      );
    }
  }

  handleCodeSubmit() {
    if (this.parametres) {
      this.parametresService.updateCodeVerification(this.parametres.id, this.parametresForm.value).subscribe(
        () => this.handleSuccess('Code PIN mis à jour avec succès'),
        () => this.showError('Erreur lors de la mise à jour du Code PIN')
      );
    } else {
      this.parametresService.addCodeVerification(this.parametresForm.value).subscribe(
        () => this.handleSuccess('Code PIN ajouté avec succès'),
        () => this.showError('Erreur lors de l\'ajout du Code PIN')
      );
    }
  }

  handleEmailSubmit() {
    if (this.parametres) {
      this.parametresService.updateParametres(this.parametres.id, this.parametresForm.value).subscribe(
        () => this.handleSuccess('Paramètres E-mail mis à jour avec succès'),
        () => this.showError('Erreur lors de la mise à jour des paramètres E-mail')
      );
    } else {
      this.parametresService.addParametres(this.parametresForm.value).subscribe(
        () => this.handleSuccess('Paramètres E-mail ajoutés avec succès'),
        () => this.showError('Erreur lors de l\'ajout des paramètres E-mail')
      );
    }
  }

  handleAttributSubmit() {
    if (this.parametres) {
      this.parametresService.updateAttribut(this.parametres.id, this.parametresForm.value).subscribe(
        () => this.handleSuccess('Supplement mis à jour avec succès'),
        (error) => this.showError('Erreur lors de la mis à jour du supplement')
      );
    } else {
      this.parametresService.addAttribut(this.parametresForm.value).subscribe(
        () => this.handleSuccess('Supplement ajouté avec succès'),
        () => this.showError('Erreur lors de l\'ajout du supplement')
      );
    }
  }

  handleTypeVehiculeSubmit() {
    if (this.parametres) {
      this.parametresService.updateTypeVehicule(this.parametres.id, this.parametresForm.value).subscribe(
        () => this.handleSuccess('Type de véhicule mis à jour avec succès'),
        () => this.showError('Erreur lors de la mise à jour du type de véhicule')
      );
    } else {
      this.parametresService.addTypeVehicule(this.parametresForm.value).subscribe(
        () => this.handleSuccess('Type de véhicule ajouté avec succès'),
        () => this.showError('Erreur lors de l\'ajout du type de véhicule')
      );
    }
  }

  handlePaypalSubmit() {
    if (this.parametres) {
      this.parametresService.updatePayPal(this.parametres.id, this.parametresForm.value).subscribe(
        () => this.handleSuccess('Configuration PayPal mise à jour avec succès'),
        () => this.showError('Erreur lors de la mise à jour de la configuration PayPal')
      );
    } else {
      this.parametresService.addPaypal(this.parametresForm.value).subscribe(
        () => this.handleSuccess('Configuration PayPal ajoutée avec succès'),
        () => this.showError('Erreur lors de l\'ajout de la configuration PayPal')
      );
    }
  }

  handleVirementBancaireSubmit() {
    if (this.parametres) {
      this.parametresService.updateVirement(this.parametres.id, this.parametresForm.value).subscribe(
        () => this.handleSuccess('Configuration de virement bancaire mise à jour avec succès'),
        () => this.showError('Erreur lors de la mise à jour de la configuration de virement bancaire')
      );
    } else {
      this.parametresService.addVirement(this.parametresForm.value).subscribe(
        () => this.handleSuccess('Configuration de virement bancaire ajoutée avec succès'),
        () => this.showError('Erreur lors de l\'ajout de la configuration de virement bancaire')
      );
    }
  }

  handleSuccess(detail: string) {
    this.showSuccess(detail);
    this.onClose.emit();
    this.visibleChange.emit(false);
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  closeDialog() {
    this.visibleChange.emit(false);
  }

  closeDialogPartenaire() {
    this.visiblePartenaire = false; // Set visibility to false
    this.visiblePartenaireChange.emit(this.visiblePartenaire); // Emit the change event for two-way binding
    this.close.emit(); // Emit close event to parent component
  }

  getLogoUrl(photoFileName: string): string {
    if (photoFileName) {
      return photoFileName;
    } else {
      return '/assets/demo/images/logo.jpg';
    }
  }

  isAdministrateur(): boolean {
    const userType = this.parametresService.getUserType();
    return userType === 'administrateur';
  }

}
