import { Component, OnInit } from '@angular/core';
import { CrmService } from '../../utilitaires/services/crm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {

  infoProfile: any;

  breadcrumbItems: MenuItem[] = [];
  detailsDialogVisible: boolean = false;
  feedbacks: any[] = [];
  currentPage: number = 1;  // Current page number
  totalRecords: number = 0; // Total number of feedbacks
  rows: number = 10;  // Number of feedbacks per page

  associationDialogVisible: boolean = false;
  confirmationVisible: boolean = false;
  entrepriseKey: string = '';
  confirmationMessage: string = '';
  keyValidationError: boolean = false;
  loading: boolean = false;
  actionType: string = 'associate';

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

  constructor(
    private chauffeurService: CrmService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Chauffeur' });
    this.breadcrumbItems.push({ label: 'Profil' });
    this.getProfil()
  }

  getProfil(page: number = 1) {
    this.chauffeurService.getChauffeurProfile(page).subscribe({
      next: (data) => {
        this.infoProfile = data.results;
        this.feedbacks = this.infoProfile.feedbacks || [];  // Update feedbacks array directly
        this.totalRecords = data.count;  // Total number of records from API
        console.log(data);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;  // Page number is zero-indexed, so add 1
    this.getProfil(this.currentPage);   // Fetch the data for the selected page
  }


  getLogoUrl(photoFileName: string): string {
    if (photoFileName) {
      return `${environment.Url}${photoFileName}`;
    } else {
      return '/assets/demo/images/avatar7.png';
    }
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

  showDialog() {
    this.detailsDialogVisible = true;  // Open the dialog without passing feedbacks
  }

  confirmDissociation(): void {
    this.actionType = 'dissociate';
    this.confirmationMessage = 'Voulez-vous vraiment vous dissocier de votre entreprise actuelle ?';
    this.confirmationVisible = true;
  }

  // Ouvrir le dialogue de confirmation pour associer
  confirmAssociation(): void {
    if (this.entrepriseKey) {
      this.actionType = 'associate';
      this.confirmationMessage = `Voulez-vous vraiment vous associer à l'entreprise avec la clé : ${this.entrepriseKey} ?`;
      this.confirmationVisible = true;
    } else {
      this.showError("Veuillez entrer une clé d'entreprise valide.");
    }
  }

// Modifiez cette partie du code pour permettre l'ajout dynamique de la clé d'entreprise
executeAction(): void {
  this.confirmationVisible = false;
  this.loading = true;

  // Utilisation de "as any" pour rendre l'objet data plus flexible
  let data: { user_id: any, entreprise_key?: string } = { user_id: this.infoProfile.chauffeur_info.user_id };

  if (this.actionType === 'associate') {
    data.entreprise_key = this.entrepriseKey;
  }

  setTimeout(() => {
    this.chauffeurService.associerDissocierChauffeur(data).subscribe({
      next: (response) => {
        this.showSuccess(response.message);
        this.loading = false;
        this.getProfil();
      },
      error: (err) => {
        this.showError(`Erreur lors de la ${this.actionType === 'associate' ? 'association' : 'dissociation'}.`);
        this.loading = false;
        console.error(err)
      }
    });
  }, 1500);
}



  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 3000 });
  }

  // Error Toast
  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 3000 });
  }

  openAssociationDialog(): void {
    this.associationDialogVisible = true;
  }

  // Valider la clé d'entreprise avant de confirmer
  validateEntrepriseKey(): void {
    if (this.entrepriseKey.length < 25) {
      this.keyValidationError = true;
    } else {
      this.keyValidationError = false;
      this.associationDialogVisible = false;  // Fermer le dialogue de saisie
      this.confirmationMessage = `Voulez-vous vraiment vous associer avec l'entreprise ayant la clé : ${this.entrepriseKey} ?`;
      this.confirmationVisible = true;  // Ouvrir le dialogue de confirmation
    }
  }
}
