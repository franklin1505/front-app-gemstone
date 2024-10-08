import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrmService } from '../../../../utilitaires/services/crm.service';
import { MessageService } from 'primeng/api';

declare const google: any;

@Component({
  selector: 'app-add-vehicule',
  templateUrl: './add-vehicule.component.html',
  styleUrls: ['./add-vehicule.component.css']
})
export class AddVehiculeComponent implements OnInit {
  loading: boolean = false;
  typesVehicules: any[] = [];
  entrepriseId!: number;
  entreprise: any;
  successMessage!: string;
  errorMessage!: string;
  vehiculeForm: FormGroup;
  prixForm: FormGroup;
  selectedFile: File | null = null;
  vehiculeId : any;
  tarifVisible:boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private _gveService: CrmService,
    private _parametresService: CrmService,
  ) {
    this.vehiculeForm = this.formBuilder.group({
      typeVehicule: ['', Validators.required],
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      annee_fabrication: [''],
      immatriculation: [''],
      capacite_passagers: ['', Validators.required],
      capacite_chargement: [''],
      tempsDisponibilite: [''],
      lieu_de_base: ['', Validators.required],
      moteur: [''],
      couleur_interieur: [''],
      couleur_exterieur: [''],
      puissance: [''],
      type_carburant: [''],
      longueur: [''],
      transmission: [''],
      supplement: [''],
      nombre_bagages: [''],
      type_bagages: [''],
      validation: true,
      avertissement: true
    });

    this.prixForm = this.formBuilder.group({
      prixParKm: [0, Validators.required],
      prixParDuree: [0, Validators.required],
      fraisReservation: [0, Validators.required],
      fraisLivraison: [0, Validators.required],
      fraisParDefaut: [0, Validators.required]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.entrepriseId = +params['entrepriseId'];
      this._gveService.getEntrepriseDetail(this.entrepriseId).subscribe(
        (entreprise) => {
          this.entreprise = entreprise;
        },
        (error) => {
          console.error('Erreur lors de la récupération des données de l\'entreprise:', error);
        }
      );
    });

    this.getTypeVehicule();
  }

  getTypeVehicule(): void {
    this._parametresService.getAllTypeVehicule().subscribe((data: any[]) => {
      this.typesVehicules = data;
    });
  }


  onFileSelected(event: any) {
    if (event && event.files && event.files.length > 0) {
      this.selectedFile = event.files[0];
    } else {
      console.error('Aucun fichier sélectionné.');
    }
  }

  onSubmit() {
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

      setTimeout(() => {
        this._gveService.createVehicule(formData).subscribe(
          (response) => {
            console.log('Véhicule ajouté avec succès', response);
            this.successMessage = 'Données ont été ajoutées avec succès';
            this.showSuccess(this.successMessage);

            // Récupérer l'ID du véhicule de la réponse
            const vehiculeId = response.id;

            // Ouvrir le dialogue pour la tarification
            this.showTarif(vehiculeId);

            this.vehiculeForm.reset();
            this.loading = false;
          },
          (error) => {
            console.error('Erreur lors de l\'ajout du véhicule:', error);
            this.showError('Erreur lors de l\'ajout du véhicule:');
            this.loading = false;
          }
        );
      }, 1000);
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement.';
      this.showError(this.errorMessage);
    }
  }

  showTarif(id: any) {
    this.vehiculeId = id; // Stocker l'ID du véhicule pour l'utiliser lors de la tarification
    this.tarifVisible = true;
  }

  savePrix(): void {
    this.loading = true;

    if (this.prixForm.valid) {
      const prixData = {
        vehicule: this.vehiculeId, // Utiliser l'ID du véhicule stocké
        ...this.prixForm.value
      };

      this._gveService.createPrix(prixData).subscribe(
        () => {
          setTimeout(() => {
            this.successMessage = 'Tarification ajoutée avec succès';
            this.showSuccess(this.successMessage);
            const userType = this._gveService.getUserType();
            if (userType === 'partenaire') {
              this.router.navigate(['/app/partenaire/mes-vehicules'], { queryParams: { entrepriseId: this.entrepriseId } });
            } else {
              this.router.navigate(['/app/parametres/']);
            }
            this.loading = false;
          }, 1500);
        },
        (error) => {
          console.error("Erreur lors de l'ajout des tarifs :", error);
          this.showError("Erreur lors de l'ajout des tarifs");
          this.loading = false;
        }
      );
    }
  }


  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  generateOptions(nombre_maximum: number): number[] {
    return Array.from({ length: nombre_maximum }, (_, i) => i + 1);
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


}
