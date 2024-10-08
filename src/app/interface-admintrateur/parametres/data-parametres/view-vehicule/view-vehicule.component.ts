import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { CrmService } from '../../../../utilitaires/services/crm.service';

@Component({
  selector: 'app-view-vehicule',
  templateUrl: './view-vehicule.component.html',
  styleUrls: ['./view-vehicule.component.css']
})
export class ViewVehiculeComponent implements OnInit {
  detailsDialogVisible: boolean = false;
  tarifVisible: boolean = false;
  visible: boolean = false;
  breadcrumbItems: MenuItem[] = [];
  vehicules: any[] = [];
  prix: any;
  id: any;
  vehiculesCount!: number;
  entrepriseId!: number;
  prixList: any;
  successMessage = '';
  warningForm: FormGroup;
  errorMessage = '';
  loading: boolean = false;
  isMonEntreprise: boolean = false;
  selectedVehicule: any = null;
  prixForm!: FormGroup;
  typeEntreprise = 'mon_entreprise'
  validationForm: FormGroup;
  items!: MenuItem[];
  visibleDialog: boolean = false;
  dialogType: string = '';

  constructor(private router: Router,
    private _gveService: CrmService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,
  ) {
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

    this.prixForm = this.fb.group({
      prixParKm: [0, Validators.required],
      prixParDuree: [0, Validators.required],
      fraisReservation: [0, Validators.required],
      fraisLivraison: [0, Validators.required],
      fraisParDefaut: [0, Validators.required]
    });
  }

  ngOnInit() {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Paramètres' });
    this.breadcrumbItems.push({ label: 'Véhicules' });

    this.route.params.subscribe(params => {
      this.isMonEntreprise = params['typeEntreprise'] === 'mon_entreprise';
    });

    this.route.params.subscribe((params) => {
      this.entrepriseId = +params['id'];
      console.log('retourner',this.entrepriseId)
      this.getVehicules(this.entrepriseId)
    });

    this._gveService.getPrix().subscribe((data) => {
      this.prixList = data;
    });
  }
  navigateToDashboard2 = () => {
    this.router.navigate(['/app/parametres/partenaire']);
  }

  getVehicules(id:any) {

    this._gveService.getVehiculesForEntreprise(id).subscribe((data) => {
      this.vehicules = data;
      console.log(data)
    });
  }
  navigateToDashboard = () => {
    this.router.navigate(['/app/parametres']);
  }

  getPrixId(vehiculeId: number): number | null {
    const prix = this.prixList.find((prix: { vehicule: number; }) => prix.vehicule === vehiculeId);
    return prix ? prix.id : null;
  }

  hasPrix(vehiculeId: number): boolean {
    return this.prixList && this.prixList.some((prix: { vehicule: number; }) => prix.vehicule === vehiculeId);
  }

  getLogoUrl(galerieFileName: string): string {
    if (galerieFileName) {
      // Utilisez le chemin vers le dossier des logos sur votre serveur Django.
      return galerieFileName;
    } else {
      // Utilisez un chemin local vers une image par défaut.
      return '/assets/layout/images/vehicules.png';
    }
  }

  reload() {
    window.location.reload();
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

  showDetails(vehicule: any) {
    this.selectedVehicule = vehicule;
    console.log(this.selectedVehicule)
    this.detailsDialogVisible = true;
  }

  showDialog(vehicule: any) {
    this.visible = true;
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  delete(vehicule: any): void {
    this._gveService.deleteVehicule(vehicule.id).subscribe({
      next: (res) => {
        setTimeout(() => {
          console.log('Véhicule supprimé avec succès', vehicule);
          this.showSuccess('Véhicule supprimé avec succès');
          location.reload();
        }, 1500);
      },
      error: (e) => {
        console.error(e)
      }
    });
  }

  showTarif(id: any) {
    this.id = id;
    if (this.hasPrix(id)) {
      const prixId = this.getPrixId(id);
      if (prixId) {
        this.getPrixDetails(prixId);
      }
    } else {
      this.prix = {
        prixParKm: 0,
        prixParDuree: 0,
        fraisReservation: 0,
        fraisLivraison: 0,
        fraisParDefaut: 0
      };
      this.tarifVisible = true;
    }
  }

  getPrixDetails(prixId: number): void {
    this._gveService.getPrixDetail(prixId).subscribe(
      (prix) => {
        this.prix = prix;
        this.prixForm.patchValue(prix);
        this.tarifVisible = true; // Affiche le dialogue après avoir récupéré les détails du prix
      },
      (error) => {
        console.error("Erreur lors de la récupération des données du prix :", error);
        this.prix = {
          prixParKm: 0,
          prixParDuree: 0,
          fraisReservation: 0,
          fraisLivraison: 0,
          fraisParDefaut: 0
        };
        this.tarifVisible = true; // Affiche le dialogue même en cas d'erreur
      }
    );
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
        label: 'Activer le vehicule',
        command: () => this.openActionDialog('activer', id)
      });
    } else {
      this.items.push({
        label: 'Désactiver le vehicule',
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
        warning_type: 'vehicule',
      });
    } else if (this.dialogType === 'activer') {
      this.validationForm.patchValue({
        entity_id: id,
        entity_type: 'vehicule',
        action: 'activer',
      });
    } else if (this.dialogType === 'desactiver') {
      this.validationForm.patchValue({
        entity_id: id,
        entity_type: 'vehicule',
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
            this.getVehicules(this.entrepriseId);
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
