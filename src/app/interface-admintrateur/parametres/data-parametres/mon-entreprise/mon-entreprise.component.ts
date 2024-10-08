import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrmService } from '../../../../utilitaires/services/crm.service';
import { MessageService } from 'primeng/api';

declare const google: any;

@Component({
  selector: 'app-mon-entreprise',
  templateUrl: './mon-entreprise.component.html',
  styleUrls: ['./mon-entreprise.component.css']
})
export class MonEntrepriseComponent implements OnInit {
  visible: boolean = false;
  loading: boolean = false;
  entrepriseForm: FormGroup;
  entrepriseId!: number;
  logoUrl: any | null = null;
  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private _gveService: CrmService
  ) {
    this.entrepriseForm = this.formBuilder.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      site_web: ['', Validators.required],
      description: [''],
      lieu_operation: ['', Validators.required],
      type_entreprise: ['mon_entreprise'], // Définir par défaut
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

  ngOnInit(): void {
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
        if (data.logo) this.logoUrl = data.logo;
/*         if (data.logo) this.logoUrl = `${environment.apiUrl}${data.logo}`;
 */      },
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

  generateEntrepriseKey(longueur: number = 25): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: longueur }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  }

  onSubmit() {
    if (this.entrepriseForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }
    this.loading = true

    const formData = new FormData();
    Object.keys(this.entrepriseForm.value).forEach(key => formData.append(key, this.entrepriseForm.value[key]));

    if (!this.entrepriseId) {
      formData.append('entrepriseKey', this.generateEntrepriseKey());
      const userId = this._gveService.getUserId();
      if (userId) {
        formData.append('utilisateur', userId);
      }
    }
    if (this.selectedFile) formData.append('logo', this.selectedFile, this.selectedFile.name);

    if (this.entrepriseId) {
      setTimeout(() => {

        this._gveService.updateEntreprise(this.entrepriseId, formData).subscribe(
          () => {
            this.loading = false
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Entreprise mise à jour avec succès' });
            this.router.navigate(['/app/parametres']);
          },
          (error) => {
            this.loading = false
            console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la mise à jour de l\'entreprise.' });
          }
        );
      }, 1500);
    } else {
      setTimeout(() => {

        this._gveService.createMonEntreprise(formData).subscribe(
          () => {
            this.loading = false
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Entreprise ajoutée avec succès' });
            this.router.navigate(['/app/parametres']);
          },
          (error) => {
            this.loading = false
            console.error('Erreur lors de l\'ajout de l\'entreprise:', error);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'ajout de l\'entreprise.' });
          }
        );
      }, 1500);
    }
  }

  initAutocomplete() {
    // Champ pour l'adresse de départ
    const adresseInput = document.getElementById('adresse') as HTMLInputElement;
    const adresseAutocomplete = new google.maps.places.Autocomplete(adresseInput, {
      types: [],
    });
    adresseAutocomplete.addListener('place_changed', () => {
      this.entrepriseForm.patchValue({ adresse: adresseInput.value });
    });

   // Champ pour le lieu d'opération
   const lieuOperationInput = document.getElementById('lieu_operation') as HTMLInputElement;
   const lieuOperationAutocomplete = new google.maps.places.Autocomplete(lieuOperationInput, {
     types: [], // Vous pouvez spécifier des types comme 'address' ou 'establishment' si nécessaire
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

}
