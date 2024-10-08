import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { CrmService } from '../../utilitaires/services/crm.service';

@Component({
  selector: 'app-chauffeurs',
  templateUrl: './chauffeurs.component.html',
  styleUrls: ['./chauffeurs.component.css']
})
export class ChauffeursComponent implements OnInit {
  detailsDialogVisible: boolean = false;
  visible: boolean = false;
  selectedChauffeur: any = null;
  breadcrumbItems: MenuItem[] = [];
  chauffeurs: any[] = [];
  chauffeursCount!: number;
  entrepriseId!: number;
  selectedUserId: any
  isMonEntreprise: boolean = false;
  errorMessage = '';
  loading: boolean = false;
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

  }

  ngOnInit() {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Entreprise Partenaire' });
    this.breadcrumbItems.push({ label: 'Chauffeurs' });

    // Subscribe to the query parameters to get 'entrepriseId'
    this.route.queryParams.subscribe((params) => {
      this.entrepriseId = +params['entrepriseId']; // Retrieve entrepriseId from the URL
      this.getChauffeurs();
    });

   const user_id= this._gveService.getUserId()
   console.log(user_id)
  }


  getChauffeurs() {
    this._gveService.getChauffeursByEntreprise(this.entrepriseId).subscribe((data) => {
      this.chauffeurs = data;
      console.log(this.chauffeurs)
    });
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/partenaire/profil']);
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

  getSeverity(item: any) {
    return item.validation ? 'success' : 'danger';
  }
  action(item: any, id: any) {
    this.items = [
      {
        label: 'Demande une activation',
        command: () => this.openActionDialog('demande', id)
      },
      {
        label: item.is_active ? 'Bloquer le chauffeur' : 'Débloquer le chauffeur',
        command: () => this.openActionDialog(item.is_active ? 'bloquer' : 'débloquer', id)
      }
    ];
  }

  openActionDialog(type: string, id: any) {
    this.dialogType = type;
    this.selectedUserId = id; // Store the ID for use in submitAction()
    this.visibleDialog = true;
  }

  closeDialog() {
    this.visibleDialog = false;
    this.dialogType = '';
    this.selectedUserId = null; // Reset selectedUserId when closing the dialog
  }

  getDialogTitle() {
    const titles: { [key: string]: string } = {
      demande: "Requete d'activation de compte",
      bloquer: "Bloquer compte Chauffeur",
      débloquer: "Débloquer compte Chauffeur"
    };
    return titles[this.dialogType] || '';
  }

  getDialogContent() {
    const contents: { [key: string]: string } = {
      demande: "Êtes-vous sûr de vouloir envoyer la requête d'activation de compte de ce chauffeur?",
      bloquer: "Êtes-vous sûr de vouloir bloquer le compte de ce chauffeur?",
      débloquer: "Êtes-vous sûr de vouloir débloquer le compte de ce chauffeur?"
    };
    return contents[this.dialogType] || '';
  }

  getDialogFooter() {
    return this.dialogType === 'demande' || this.dialogType === 'bloquer' || this.dialogType === 'débloquer';
  }

  onToggleAccountStatus(userId: number, actionType: string): void {
    this.loading = true;
    setTimeout(() => {
      this._gveService.toggleChauffeurAccountStatus(userId).subscribe({
        next: (response) => {
          this.loading = false;
          const successMessage = `Le compte a été ${actionType === 'bloquer' ? 'bloqué' : 'débloqué'} avec succès.`;
          this.showSuccess(successMessage);
          this.getChauffeurs();
        },
        error: (error) => {
          this.loading = false;
          console.error(error);
          this.showError('Erreur lors de l\'activation ou désactivation du compte.');
        }
      });
    }, 1500);
  }

  submitAction() {
    if (this.dialogType === 'demande') {
      this.demanderActivationCompte(this.selectedUserId);
    } else if (this.dialogType === 'bloquer' || this.dialogType === 'débloquer') {
      this.onToggleAccountStatus(this.selectedUserId, this.dialogType);
    }

    this.closeDialog();
  }


  demanderActivationCompte(userId: number): void {
    this.loading = true;
    console.log(userId)
    setTimeout(() => {

      // Adjusted payload to use 'chauffeur_id' as required by the API
      this._gveService.demanderActivationCompte({ chauffeur_id: userId }).subscribe(
        (response) => {
          console.log('Demande d\'activation de compte envoyée avec succès', response);
          this.loading = false;
          this.successMessage = 'Demande d\'activation de compte envoyée avec succès.';
          this.showSuccess(this.successMessage);
        },
        (error) => {
          this.loading = false;
          console.error('Erreur lors de la demande d\'activation de compte', error);
          this.errorMessage = 'Erreur lors de la demande d\'activation de compte.';
          this.showError(this.errorMessage);
        }
      );
    }, 1500);
  }

}


