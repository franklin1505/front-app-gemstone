import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { CrmService } from '../../../../utilitaires/services/crm.service';

@Component({
  selector: 'app-entreprise-partenaire',
  templateUrl: './entreprise-partenaire.component.html',
  styleUrls: ['./entreprise-partenaire.component.css']
})
export class EntreprisePartenaireComponent implements OnInit {
  typeEntreprise = 'entreprise_partenaire';
  selectedPartenaire: any;
  warningForm: FormGroup;
  validationForm: FormGroup;
  breadcrumbItems: MenuItem[] = [];
  entreprises: any[] = [];
  loading: boolean = false;
  selectedEntreprise: any | null = null;
  visiblePartenaire: boolean = false;
  items!: MenuItem[];
  visibleDialog: boolean = false;
  dialogType: string = '';

  constructor(private router: Router,
    private messageService: MessageService,
    private _gveService: CrmService,
    private route: ActivatedRoute,
    private fb: FormBuilder,) {
    this.warningForm = this.fb.group({
      entity_id: [''],
      message: [''],
      warning_type: ['']
    });
    this.validationForm = this.fb.group({
      entity_id: [''],
      entity_type: [''],
      action: [''],
    });
  }

  ngOnInit() {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Paramètres' });
    this.breadcrumbItems.push({ label: 'Partenaires' });
    this.getEntreprisesPartenaire()

  }
  getEntreprisesPartenaire() {
    this._gveService.getEntreprisesPartenaire().subscribe((data) => {
      this.entreprises = data;
      console.log(this.entreprises)
    });
  }

  getLogoUrl(photoFileName: string): string {
    if (photoFileName) {
      return photoFileName;
    } else {
      return '/assets/demo/images/logo.jpg';
    }
  }

  showDetails(entreprise: any) {
    this.selectedEntreprise = entreprise;
    this.visiblePartenaire = true; // Set dialog visibility to true
  }

  closeDialog() {
    this.visiblePartenaire = false; // Set dialog visibility to false
    this.selectedEntreprise = null;
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  isAdministrateur(): boolean {
    const userType = this._gveService.getUserType();
    return userType === 'administrateur';
  }

  getSeverity(item: any) {
    return item.validation ? 'success' : 'danger';
  }

  action(item: any, id: any) {
    this.items = [];

    this.items.push({
      label: 'Avertir l\'entreprise',
      command: () => this.openActionDialog('avertir', id)
    });

    if (!item.validation) {
      this.items.push({
        label:  'Activer l\'entreprise',
        command: () => this.openActionDialog('activer', id)
      });
    } else {
      this.items.push({
        label: 'Désactiver l\'entreprise',
        command: () => this.openActionDialog('desactiver', id)
      });
    }
  }

  openActionDialog(type: string, id: any) {

    this.dialogType = type;
    this.visibleDialog = true;
    if (this.dialogType === 'avertir') {
      this.warningForm.patchValue({
        entity_id: id,
        warning_type: 'entreprise',
      });
    } else if (this.dialogType === 'activer') {
      this.validationForm.patchValue({
        entity_id: id,
        entity_type: 'entreprise',
        action: 'activer',
      });
    } else if (this.dialogType === 'desactiver') {
      this.validationForm.patchValue({
        entity_id: id,
        entity_type: 'entreprise',
        action: 'desactiver',
      });
    }

  }

  closeDialogAction() {
    this.visibleDialog = false;
    this.dialogType = '';
  }

  submitWarning(): void {
    if (this.warningForm.invalid) {
      this.showError('Le message est requis.');
      return;
    }

    this.loading = true;

    setTimeout(() => {
      const formData = this.warningForm.value;

      this._gveService.sendAvertissement(formData.entity_id, formData.message, formData.warning_type)
        .subscribe({
          next: (response) => {
            this.showSuccess('Avertissement envoyé avec succès.');
            this.loading = false;
            this.validationForm.reset()
          },
          error: (error) => {
            this.showError('Erreur lors de l\'envoi de l\'avertissement.');
            console.error(error)
            this.loading = false;
          }
        });
    }, 1500); // Simulating loading for 1500ms
  }

  submitToggleValidation(): void {
    if (this.validationForm.invalid) {
      this.showError('Les informations de validation sont manquantes.');
      return;
    }

    this.loading = true;

    setTimeout(() => {
      const formData = this.validationForm.value;

      this._gveService.toggleValidation(formData.entity_id, formData.entity_type, formData.action)
        .subscribe({
          next: (response) => {
            this.showSuccess(`L'${formData.entity_type} a été ${formData.action} avec succès.`);
            this.loading = false;
            this.getEntreprisesPartenaire();
          },
          error: (error) => {
            this.showError('Erreur lors de l\'envoi de l\'action de validation.');
            this.loading = false;
            console.log(error)
          },
        });
    }, 1500); // Simulating loading for 1500ms
  }

}
