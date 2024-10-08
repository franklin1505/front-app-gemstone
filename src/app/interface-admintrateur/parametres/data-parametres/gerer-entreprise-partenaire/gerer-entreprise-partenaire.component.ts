import { Component, OnInit } from '@angular/core';
import { CrmService } from '../../../../utilitaires/services/crm.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-gerer-entreprise-partenaire',
  templateUrl: './gerer-entreprise-partenaire.component.html',
  styleUrls: ['./gerer-entreprise-partenaire.component.css']
})

export class GererEntreprisePartenaireComponent implements OnInit {
  partenaireForm: FormGroup;
  entrepriseForm: FormGroup;
  entrepriseId: any;
  logoUrl: any | null = null;
  selectedFile: File | null = null;
  visible: boolean = false;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _gveService: CrmService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.partenaireForm = this.fb.group({
      type_utilisateur: ['partenaire'], // Default value set to 'partenaire'
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      lieu_operation: ['', Validators.required],
      utilisateur: [''] // This might be an ID or some other identifier
    });

    this.entrepriseForm = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      site_web: ['', Validators.required],
      description: [''],
      pays_operation: ['', Validators.required],
      lieu_operation: ['', Validators.required],
      type_entreprise: [''], // Default value
      nom_DG: [''],
      contact_DG: [''],
      email_DG: [''],
      nom_Dr_des_Finances: [''],
      contact_Dr_des_Finances: [''],
      email_Dr_des_Finances: [''],
      nom_Charge_de_la_clientele: [''],
      contact_Charge_de_la_clientele: [''],
      email_Charge_de_la_clientele: [''],
      validation: [false],
      logo: null,
      avertissement: [false],
      utilisateur: [''],
      siren_siret: [''],
      numero_tva: [''],
      code_Postal: [''],
      code_Naf: [''],
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.entrepriseId = +params['id'];
      if (this.entrepriseId) {
        this.loadEntreprise();
      }
    });
  }

  loadEntreprise() {
    this._gveService.getEntrepriseDetail(this.entrepriseId).subscribe(
      (data) => {
        this.entrepriseForm.patchValue(data);
        if (data.logo) this.logoUrl = data.logo;  // Store the current logo URL
      },
      (error) => {
        console.error('Erreur lors de la récupération des détails de l\'entreprise:', error);
      }
    );
  }

  onFileSelected(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedFile = event.files[0] as File;
      this.getLogoPreview(this.selectedFile);
    } else {
      console.error('Aucun fichier sélectionné.');
    }
  }

  private getLogoPreview(logo: File | null): void {
    if (logo instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoUrl = reader.result as string;
      };
      reader.readAsDataURL(logo);
    } else {
      this.logoUrl = null;
    }
  }

  onSubmit() {
    this.loading = true;

    if (this.entrepriseId) {
      const formData = new FormData();

      // Append all form data except the logo
      Object.keys(this.entrepriseForm.value).forEach(key => {
        if (key !== 'logo') { // Exclude the 'logo' field for now
          formData.append(key, this.entrepriseForm.value[key]);
        }
      });

      // Only append the logo if a new file has been selected
      if (this.selectedFile) {
        formData.append('logo', this.selectedFile, this.selectedFile.name);
      }

      setTimeout(() => {
        this._gveService.updateEntreprise(this.entrepriseId, formData).subscribe(
          () => {
            this.loading = false;
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Entreprise mise à jour avec succès' });
            const userType = this._gveService.getUserType();

            if (userType === 'partenaire') {
              this.router.navigate(['/app/partenaire/profil']);
            } else {
              this.router.navigate(['/app/parametres/partenaire']);
            }
          },
          (error) => {
            this.loading = false;
            console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la mise à jour de l\'entreprise.' });
          }
        );
      }, 1500);

    } else {
      // Handle creation of a new partner
      if (this.partenaireForm.invalid) {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez remplir tous les champs obligatoires.' });
        return;
      }

      const userId = this._gveService.getUserId();
      if (userId) {
        this.partenaireForm.patchValue({ utilisateur: userId });
      }

      const data = this.partenaireForm.value;
      setTimeout(() => {
        this._gveService.registerUser(data).subscribe(
          () => {
            this.loading = false;
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Entreprise ajoutée avec succès' });
            this.router.navigate(['/app/parametres/partenaire']);
          },
          (error) => {
            this.loading = false;
            console.error('Erreur lors de l\'ajout de l\'entreprise:', error);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'ajout de l\'entreprise.' });
          }
        );
      }, 1500);
    }
  }


  initAutocomplete() {
    // Address input
    const adresseInput = document.getElementById('adresse') as HTMLInputElement;
    const adresseAutocomplete = new google.maps.places.Autocomplete(adresseInput, {
      types: [],
    });
    adresseAutocomplete.addListener('place_changed', () => {
      this.entrepriseForm.patchValue({ adresse: adresseInput.value });
    });

    adresseAutocomplete.addListener('place_changed', () => {
      this.partenaireForm.patchValue({ adresse: adresseInput.value });
    });

    // Operation location input
    const lieuOperationInput = document.getElementById('lieu_operation') as HTMLInputElement;
    const lieuOperationAutocomplete = new google.maps.places.Autocomplete(lieuOperationInput, {
      types: [],
    });
    lieuOperationAutocomplete.addListener('place_changed', () => {
      this.partenaireForm.patchValue({ lieu_operation: lieuOperationInput.value });
    });

    lieuOperationAutocomplete.addListener('place_changed', () => {
      this.entrepriseForm.patchValue({ lieu_operation: lieuOperationInput.value });
    });
  }

  handleSubmit() {
    if (this.entrepriseId) {
      this.visible = true;
    } else {
      this.onSubmit();
    }
  }

  retour() {
    
    const userType = this._gveService.getUserType();
    if (userType === 'partenaire') {
      this.router.navigate(['/app/partenaire/profil']);
    } else {
      this.router.navigate(['/app/parametres/partenaire']);
    }
  }

}
