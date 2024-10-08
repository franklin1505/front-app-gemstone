import { Component, OnInit } from '@angular/core';
import { CrmService } from '../../utilitaires/services/crm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-mise-a-jour',
  templateUrl: './mise-a-jour.component.html',
  styleUrls: ['./mise-a-jour.component.css']
})
export class MiseAJourComponent implements OnInit {
  userInfo: any;
  id: any;
  visible: boolean = false;
  loading: boolean = false;
  type_entreprise = 'mon_entreprise'
  langues = [
    { id: 1, nom: 'Anglais' },
    { id: 2, nom: 'Chinois Mandarin' },
    { id: 3, nom: 'Hindi' },
    { id: 4, nom: 'Espagnol' },
    { id: 5, nom: 'Français' },
    { id: 6, nom: 'Arabe' },
    { id: 7, nom: 'Bengali' },
    { id: 8, nom: 'Russe' },
    { id: 9, nom: 'Portugais' },
    { id: 10, nom: 'Indonésien' }
  ];

  successMessage!: string;
  selectedFile: File | null = null;
  errorMessage!: string;
  photoUrl: string | null = null;
  entrepriseId: any;
  chauffeurId: any;
  chauffeurForm: FormGroup;

  constructor(
    private _dataService: CrmService,
    private formBuilder: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {
    this.chauffeurForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''],
      annee_experience: ['', Validators.required],
      langues_parlees: [[]],
      photo: null,
      entreprise_affiliee: null,
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.id = id;
    this.getData();
  }

  getData() {
    

    this._dataService.getChauffeurDetails(this.id).subscribe(data => {
      let languesParleesIds = [];
      try {
        if (typeof data.langues_parlees === 'string') {
          // Supprimer les caractères inattendus et analyser la chaîne en JSON
          const cleanedString = data.langues_parlees.replace(/[^0-9,]/g, '');
          languesParleesIds = cleanedString.split(',').map((id: string) => parseInt(id.trim(), 10));
        } else if (Array.isArray(data.langues_parlees)) {
          languesParleesIds = data.langues_parlees;
        }
      } catch (e) {
        console.error('Erreur lors du parsing:', e);
      }

      console.log('data', data);
      this.chauffeurForm.patchValue({
        first_name: data.first_name,
        last_name: data.last_name,
        telephone: data.telephone,
        adresse: data.adresse,
        email: data.email,
        annee_experience: data.annee_experience,
        langues_parlees: languesParleesIds,
        entreprise_affiliee: data.entreprise_affiliee
      });
      if (data.photo) {
        this.photoUrl = `${environment.Url}${data.photo}`;
        console.log(this.photoUrl)
      }
      this.chauffeurId = data.personne_ptr
      this.entrepriseId = data.entreprise_affiliee
    }, error => console.error('Erreur lors de la récupération des détails:', error));
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
    }
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
        this.photoUrl = reader.result as string;
      };
      reader.readAsDataURL(galerie);
    } else {
      this.photoUrl = null;
    }
  }

  initAutocomplete() {
    // Champ pour l'adresse de départ
    const adresseInput = document.getElementById('adresse') as HTMLInputElement;
    const adresseAutocomplete = new google.maps.places.Autocomplete(adresseInput, {
      types: [],
    });
    adresseAutocomplete.addListener('place_changed', () => {
      // Utiliser la valeur directe de l'input au lieu de `place.formatted_address`
      this.chauffeurForm.patchValue({ adresse: adresseInput.value });
    });

  }

  onSubmit() {
    const formData = new FormData();
    Object.keys(this.chauffeurForm.value).forEach((key) => {
      if (key !== 'photo') {
        formData.append(key, this.chauffeurForm.value[key]);
      }
    });
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile, this.selectedFile.name);
    }
    for (let pair of (formData as any).entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    this.loading = true;
    setTimeout(() => {
      this._dataService.PersonnalUpdateChauffeur(this.chauffeurId, formData).subscribe(
        (response) => {
          this.loading = false;
          this.successMessage = 'Données ont été enregistrées avec succès';
          this.showSuccess(this.successMessage)
          this.router.navigate(['/app/chauffeur/profil']);

        },
        (error) => {
          this.loading = false;
          this.errorMessage = 'Une erreur est survenue lors de la mise à jour du chauffeur';
          this.showError(this.errorMessage)
          console.error(error);
        }
      );
    }, 1500);
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
}
