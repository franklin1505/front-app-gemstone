import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrmService } from '../../../../utilitaires/services/crm.service';
import { MessageService } from 'primeng/api';
declare const google: any;

@Component({
  selector: 'app-add-chauffeur',
  templateUrl: './add-chauffeur.component.html',
  styleUrls: ['./add-chauffeur.component.css']
})
export class AddChauffeurComponent implements OnInit {
  chauffeurForm: FormGroup;
  entrepriseId!: number;
  entreprise: any;
  successMessage!: string;
  errorMessage!: string;
  selectedFile: File | null = null;
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
  loading: boolean = false;

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private messageService: MessageService, private router: Router, private _gveService: CrmService) {
    this.chauffeurForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''],
      annee_experience: ['', Validators.required],
      langues_parlees: [[]], // Initialisation avec un tableau
      photo: null,
      entreprise_affiliee: null,
      validation: true,
      avertissement: true,
      type_utilisateur: ['chauffeur'],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.entrepriseId = +params['entrepriseId'];
      this._gveService.getEntrepriseDetail(this.entrepriseId).subscribe(
        entreprise => { this.entreprise = entreprise; },
        error => { console.error("Erreur lors de la récupération des données de l'entreprise:", error); }
      );
    });
  }

  onFileSelected(event: any) {
    if (event && event.files && event.files.length > 0) {
      this.selectedFile = event.files[0];
      this.chauffeurForm.patchValue({ photo: this.selectedFile });
    } else {
      console.error('Aucun fichier sélectionné.');
    }
  }



  onSubmit() {
    if (this.chauffeurForm.valid) {
      this.chauffeurForm.get('entreprise_affiliee')?.setValue(this.entrepriseId);

      const selectedLangues = this.chauffeurForm.get('langues_parlees')?.value; // Récupérer les IDs des langues sélectionnées

      const formData = new FormData();
      formData.append('first_name', this.chauffeurForm.get('first_name')?.value);
      formData.append('last_name', this.chauffeurForm.get('last_name')?.value);
      formData.append('email', this.chauffeurForm.get('email')?.value);
      formData.append('telephone', this.chauffeurForm.get('telephone')?.value);
      formData.append('adresse', this.chauffeurForm.get('adresse')?.value);
      formData.append('annee_experience', this.chauffeurForm.get('annee_experience')?.value);
      formData.append('langues_parlees', JSON.stringify(selectedLangues)); // Stocker les IDs des langues
      formData.append('entreprise_affiliee', this.entrepriseId.toString());
      formData.append('validation', this.chauffeurForm.get('validation')?.value.toString());
      formData.append('avertissement', this.chauffeurForm.get('avertissement')?.value.toString());
      formData.append('type_utilisateur', this.chauffeurForm.get('type_utilisateur')?.value);

      if (this.selectedFile) {
        formData.append('photo', this.selectedFile, this.selectedFile.name); // Ajouter la photo sélectionnée
      }

      this.loading = true;

      setTimeout(() => {
        this._gveService.registerUser(formData).subscribe(
          response => {
            this.successMessage = 'Chauffeur enregistré avec succès et e-mail envoyé.';
            this.showSuccess(this.successMessage);
            const userType = this._gveService.getUserType();
            if (userType === 'partenaire') {
              this.router.navigate(['/app/partenaire/mes-chauffeurs'], { queryParams: { entrepriseId: this.entrepriseId } });
            } else {
              this.router.navigate(['/app/parametres/']);
            }
            this.chauffeurForm.reset();
            this.loading = false;
          },
          error => {
            this.loading = false;
            console.log(error);
            this.errorMessage = 'Une erreur s\'est produite lors de l\'enregistrement du chauffeur.';
            this.showError(this.errorMessage);
          }
        );
      }, 1000);
    } else {
      this.showError('Le formulaire contient des erreurs et ne peut pas être soumis.');
    }
  }


  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  initAutocomplete() {
    const adresseInput = document.getElementById('adresse') as HTMLInputElement;
    const adresseAutocomplete = new google.maps.places.Autocomplete(adresseInput, { types: [] });
    adresseAutocomplete.addListener('place_changed', () => {
      this.chauffeurForm.patchValue({ adresse: adresseInput.value });
    });
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
