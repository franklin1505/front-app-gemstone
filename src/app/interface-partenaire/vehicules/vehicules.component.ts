import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { CrmService } from '../../utilitaires/services/crm.service';

@Component({
  selector: 'app-vehicules',
  templateUrl: './vehicules.component.html',
  styleUrls: ['./vehicules.component.css']
})
export class VehiculesComponent implements OnInit {

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
  errorMessage = '';
  loading: boolean = false;
  isMonEntreprise: boolean = false;
  selectedVehicule: any = null;
  prixForm!: FormGroup;
  typeEntreprise = 'entreprise_partenaire'
  items!: MenuItem[];
  visibleDialog: boolean = false;
  dialogType: string = '';

  constructor(private router: Router,
    private _gveService: CrmService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,
  ) {

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
    this.breadcrumbItems.push({ label: 'Entreprise Partenaire' });
    this.breadcrumbItems.push({ label: 'Véhicules' });

    this.route.queryParams.subscribe((params) => {
      this.entrepriseId = +params['entrepriseId'];
      this.getVehicules()
    });

    this._gveService.getPrix().subscribe((data) => {
      this.prixList = data;
    });
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/partenaire/profil']);
  }

  getVehicules() {
    this._gveService.getVehiculesForEntreprise(this.entrepriseId).subscribe((data) => {
      this.vehicules = data;
      console.log(data)
    });
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
      return galerieFileName;
    } else {
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

  getSeverity(item: any) {
    return item.validation ? 'success' : 'danger';
  }


}
