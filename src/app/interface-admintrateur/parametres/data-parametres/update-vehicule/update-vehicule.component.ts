import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeVehicule } from '../../../../utilitaires/models/parametres';
import { CrmService } from '../../../../utilitaires/services/crm.service';
import { ConfirmationService, MessageService } from 'primeng/api';

declare const google: any;

@Component({
  selector: 'app-update-vehicule',
  templateUrl: './update-vehicule.component.html',
  styleUrls: ['./update-vehicule.component.css']
})
export class UpdateVehiculeComponent implements OnInit {
  type_entreprise = 'mon_entreprise'
  visible: boolean = false;
  loading: boolean = false;
  vehiculeId!: number;
  vehicule: any; // Assurez-vous d'avoir une classe ou une interface pour représenter un véhicule
  successMessage!: string;
  vehiculeForm: FormGroup;
  selectedFile: File | null = null;
  Preview: any | null = null;
  typesVehicules: any[] = [];
  entrepriseId!: number;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private _gveService: CrmService,
    private _parametresService: CrmService
  ) {
    this.vehiculeForm = this.formBuilder.group({
      typeVehicule: ['', Validators.required],
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      annee_fabrication: [''], // facultatif
      immatriculation: [''], // facultatif
      capacite_passagers: ['', Validators.required],
      capacite_chargement: [''], // va être calculé
      tempsDisponibilite: [''], // facultatif
      lieu_de_base: ['', Validators.required],
      moteur: [''], // facultatif
      couleur_interieur: [''], // facultatif
      couleur_exterieur: [''], // facultatif
      puissance: [''], // facultatif
      type_carburant: [''], // facultatif
      longueur: [''], // facultatif
      transmission: [''], // facultatif
      supplement: [''], // facultatif
      nombre_bagages: [''],
      type_bagages: ['']
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.entrepriseId = +params['entrepriseId'];
      this.route.params.subscribe(params => {
        this.vehiculeId = +params['id'];
        this._gveService.getVehiculeDetail(this.vehiculeId).subscribe(vehicule => {
          this.vehicule = vehicule;
          this._parametresService.getAllTypeVehicule().subscribe((data: TypeVehicule[]) => {
            this.typesVehicules = data;
            const typeVehicule = this.typesVehicules.find(tv => tv.nom_type === vehicule.typeVehicule);
            this.vehiculeForm.patchValue({
              typeVehicule: typeVehicule || '',
              marque: vehicule.marque || '',
              modele: vehicule.modele || '',
              annee_fabrication: vehicule.annee_fabrication || '',
              immatriculation: vehicule.immatriculation || '',
              capacite_passagers: Number(vehicule.capacite_passagers) || '', // Convertir en nombre
              tempsDisponibilite: vehicule.tempsDisponibilite || '',
              lieu_de_base: vehicule.lieu_de_base || '',
              moteur: vehicule.moteur || '',
              couleur_interieur: vehicule.couleur_interieur || '',
              couleur_exterieur: vehicule.couleur_exterieur || '',
              puissance: vehicule.puissance || '',
              type_carburant: vehicule.type_carburant || '',
              longueur: vehicule.longueur || '',
              transmission: vehicule.transmission || '',
              supplement: vehicule.supplement || ''
            });
            const capaciteChargement = vehicule.capacite_chargement ? vehicule.capacite_chargement.split(' ') : ['', ''];
            this.vehiculeForm.patchValue({
              nombre_bagages: Number(capaciteChargement[0]) || '', // Convertir en nombre
              type_bagages: capaciteChargement[1] || ''
            });
          });
          if (vehicule.galerie) {
            this.Preview = vehicule.galerie;
          }
        }, error => {
          console.error('Erreur lors de la récupération des données du véhicule:', error);
        });
      });
    });
    this.getTypeVehicule();
  }

  getTypeVehicule(): void {
    this._parametresService.getAllTypeVehicule().subscribe((data: TypeVehicule[]) => {
      this.typesVehicules = data;
    });
  }

  generateOptions(nombre_maximum: number): number[] {
    return Array.from({ length: nombre_maximum }, (_, i) => i + 1);
  }

  onFileSelected(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedFile = event.files[0] as File;
      this.getLogoPreview(this.selectedFile);
    } else {
      console.error('Aucun fichier sélectionné.');
    }
  }


  private getLogoPreview(galerie: File | null): void {
    if (galerie instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        this.Preview = reader.result as string;
      };
      reader.readAsDataURL(galerie);
    } else {
      this.Preview = null;
    }
  }

  onUpdate() {
    const typeVehicule = this.vehiculeForm.get('typeVehicule')?.value?.nom_type || '';
    const nombreBagages = this.vehiculeForm.get('nombre_bagages')?.value;
    const typeBagages = this.vehiculeForm.get('type_bagages')?.value;
    const capaciteChargement = `${nombreBagages} ${typeBagages}`;
    const tempsDisponibilite = this.vehiculeForm.get('tempsDisponibilite')?.value || 1;

    if (this.vehiculeForm.valid) {
      this.loading = true;
      this.vehiculeForm.patchValue({
        validation: true,
        avertissement: true,
        typeVehicule: typeVehicule,
        capacite_chargement: capaciteChargement,
        tempsDisponibilite: tempsDisponibilite
      });

      const formData = new FormData();
      formData.append('entreprise', this.entrepriseId.toString());

      for (const key in this.vehiculeForm.value) {
        if (this.vehiculeForm.value.hasOwnProperty(key) && key !== 'nombre_bagages' && key !== 'type_bagages') {
          formData.append(key, this.vehiculeForm.value[key]);
        }
      }

      if (this.selectedFile) {
        formData.append('galerie', this.selectedFile);
      }

      for (let pair of (formData as any).entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      this._gveService.updateVehicule(this.vehiculeId, formData).subscribe(
        (response) => {
          setTimeout(() => {
            console.log('Véhicule mis à jour avec succès');
            this.successMessage = 'Données mises à jour avec succès';
            this.showSuccess(this.successMessage);
            this.loading = false;
            const userType = this._gveService.getUserType();
            if (userType === 'partenaire') {
              this.router.navigate(['/app/partenaire/mes-vehicules'], { queryParams: { entrepriseId: this.entrepriseId } });
            } else {
              this.router.navigate(['/app/parametres/vehicules', this.entrepriseId, this.type_entreprise]);
            }
          }, 1500);
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du véhicule:', error);
          this.loading = false;
          this.showError('Erreur lors de la mise à jour du véhicule')
        }
      );
    }
  }

  initAutocomplete() {
    // Champ pour l'adresse de départ
    const adresseInput = document.getElementById('lieu_de_base') as HTMLInputElement;
    const adresseAutocomplete = new google.maps.places.Autocomplete(adresseInput, {
      types: [],
    });
    adresseAutocomplete.addListener('place_changed', () => {
      // Utiliser la valeur directe de l'input au lieu de `place.formatted_address`
      this.vehiculeForm.patchValue({ lieu_de_base: adresseInput.value });
    });

  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  showDialog() {
    this.visible = true;
  }

  retour() {
    const userType = this._gveService.getUserType();
    if (userType === 'partenaire') {
      this.router.navigate(['/app/partenaire/mes-vehicules'], { queryParams: { entrepriseId: this.entrepriseId } });
    } else {
      this.router.navigate(['/app/parametres/vehicules', this.entrepriseId, this.type_entreprise]);
    }
  }
}
