import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { CrmService } from '../../../../utilitaires/services/crm.service';

@Component({
  selector: 'app-view-chauffeur',
  templateUrl: './view-chauffeur.component.html',
  styleUrls: ['./view-chauffeur.component.css']
})
export class ViewChauffeurComponent implements OnInit {
  detailsDialogVisible: boolean = false;
  visible: boolean = false;
  selectedChauffeur: any = null;
  breadcrumbItems: MenuItem[] = [];
  chauffeurs: any[] = [];
  chauffeursCount!: number;
  entrepriseId!: number;
  isMonEntreprise: boolean = false;
  warningForm: FormGroup;
  errorMessage = '';
  loading: boolean = false;
  validationForm: FormGroup;
  successMessage = '';
  items!: MenuItem[];
  visibleDialog: boolean = false;
  dialogType: string = '';

  langues: any[] = [
    { id: 1, nom: 'Anglais' },
    { id: 2, nom: 'Chinois Mandarin' },
    { id: 3, nom: 'Hindi' },
    { id: 4, nom: 'Espagnol' },
    { id: 5, nom: 'Français' },
    { id: 6, nom: 'Arabe' },
    { id: 7, nom: 'Bengali' },
    { id: 8, nom: 'Russe' },
    { id: 9, nom: 'Portugais' },
    { id: 10, nom: 'Indonésien' },
  ];

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
    this.breadcrumbItems.push({ label: 'Chauffeurs' });

    this.route.params.subscribe((params) => {
      this.entrepriseId = +params['id'];
      this.isMonEntreprise = params['typeEntreprise'] === 'mon_entreprise';
      this.getChauffeurs()
    });
  }

  getChauffeurs(){
    this._gveService.getChauffeursByEntreprise(this.entrepriseId).subscribe((data) => {
      this.chauffeurs = data;
      console.log(this.chauffeurs)
    });
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/parametres']);
  }

  navigateToDashboard2 = () => {
    this.router.navigate(['/app/parametres/partenaire']);
  }

  getLanguesParlees(langues_parlees: any): string[] {
    let languesParleesBooleans: boolean[];
    if (typeof langues_parlees === 'string') {
      languesParleesBooleans = langues_parlees.split(',').map((str) => str === 'true');
    } else if (Array.isArray(langues_parlees)) {
      languesParleesBooleans = langues_parlees;
    } else if (typeof langues_parlees === 'object') {
      languesParleesBooleans = Object.values(langues_parlees).map(
        (val) => val === 'true'
      );
    } else {
      return [];
    }
    let languesFiltrees = this.langues.filter(
      (_, index) => languesParleesBooleans[index]
    );
    let nomsDesLangues = languesFiltrees.map((langue) => langue.nom);
    return nomsDesLangues;
  }

  getLogoUrl(photoFileName: string): string {
    if (photoFileName) {
      return photoFileName;
    } else {
      return '/assets/demo/images/avatar7.png';
    }
  }

  reload() {
    window.location.reload();
  }

  formatLanguesParlees(languesParleesIds: any): string {
    if (typeof languesParleesIds === 'string') {
      languesParleesIds = languesParleesIds.replace(/[^\d,]/g, '');
      try {
        languesParleesIds = languesParleesIds.split(',').map(Number);
      } catch (e) {
        console.error('Erreur lors du parsing de languesParleesIds:', e);
        return 'Données pas renseignées';
      }
    }
    if (!Array.isArray(languesParleesIds)) return 'Données pas renseignées';
    return languesParleesIds.map((id: number) => {
      const langue = this.langues.find(l => l.id === id);
      return langue ? langue.nom : null;
    }).filter(nom => nom !== null).join('⎪');
  }

  showDetails(chauffeur: any) {
    this.selectedChauffeur = chauffeur;
    this.detailsDialogVisible = true;
  }

  showDialog(chauffeur: any) {
    this.visible = true;
  }

  // supprimer une reservation
  delete(chauffeur: any): void {
    this._gveService.deleteChauffeur(chauffeur.id_chauffeur).subscribe({
      next: (res) => {
        this.loading = true;
        setTimeout(() => {
          console.log('Chauffeur supprimé avec succès', chauffeur);
          this.successMessage = 'Chauffeur supprimé avec succès';
          this.showSuccess(this.successMessage);
          this.loading = false;
          this.getChauffeurs()
        }, 1500);
      },
      error: (e) => {
        console.error(e)
        this.errorMessage = 'une erreur est surveunu lors de la supression du compte du chauffeur'
        this.showError(this.errorMessage)
      }
    });
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
      label: 'Avertir le chauffeur',
      command: () => this.openActionDialog('avertir', id)
    });

    if (!item.validation) {
      this.items.push({
        label: 'Activer le chauffeur',
        command: () => this.openActionDialog('activer', id)
      });
    } else {
      this.items.push({
        label: 'Désactiver le chauffeur',
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
        warning_type: 'chauffeur',
      });
    } else if (this.dialogType === 'activer') {
      this.validationForm.patchValue({
        entity_id: id,
        entity_type: 'chauffeur',
        action: 'activer',
      });
    } else if (this.dialogType === 'desactiver') {
      this.validationForm.patchValue({
        entity_id: id,
        entity_type: 'chauffeur',
        action: 'desactiver',
      });
    }

  }

  closeDialog() {
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
            this.showSuccess(`Le ${formData.entity_type} a été ${formData.action} avec succès.`);
            this.loading = false;
            this.getChauffeurs();
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


