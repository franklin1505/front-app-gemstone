import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { CrmService } from '../../utilitaires/services/crm.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {

  infoProfile: any;
  breadcrumbItems: MenuItem[] = [];
  @ViewChild('vehiclesMenu') vehiclesMenu!: OverlayPanel;
  @ViewChild('chauffeursMenu') chauffeursMenu!: OverlayPanel;
  detailsDialogVisible: boolean = false;
  errorMessage = '';
  loading: boolean = false;
  successMessage = '';
  selectedUserId: any
  visibleDialog: boolean = false

  detailsVisible: boolean = false;
  chauffeurs: any[] = [];
  currentPage: number = 1;  // Current page number
  totalRecords: number = 0; // Total number of feedbacks
  rows: number = 10;


  constructor(
    private partenaireService: CrmService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Entreprise Parenaire' });
    this.breadcrumbItems.push({ label: 'Profil' });
    this.getProfil()
  }

  getProfil(page: number = 1) {
    this.partenaireService.getPartenaireProfile(page).subscribe({
      next: (data) => {
        this.infoProfile = data.results || {};
        this.chauffeurs = this.infoProfile.chauffeurs || [];  // Update feedbacks array directly
        this.totalRecords = data.count;
        console.log(data);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getSeverity(item: any) {
    return item.validation ? 'success' : 'danger';
  }

  getLogoUrl(photoFileName: string): string {
    if (photoFileName) {
      return `${environment.Url}${photoFileName}`;
    } else {
      return '/assets/demo/images/avatar7.png';
    }
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;  // Page number is zero-indexed, so add 1
    this.getProfil(this.currentPage);   // Fetch the data for the selected page
  }


  showchauffeurs() {
    this.detailsVisible = true;  // Open the dialog without passing feedbacks
  }
  showDialog(type: 'details') {
    switch (type) {
      case 'details':
        this.detailsDialogVisible = true;
        break;
    }
  }


  showMenu(event: Event, menu: string) {
    switch (menu) {

      case 'vehiclesMenu':
        this.vehiclesMenu.toggle(event);
        break;
      case 'chauffeursMenu':
        this.chauffeursMenu.toggle(event);
        break;
      default:
        break;
    }
  }

  openActionDialog() {
    this.visibleDialog = true;
  }

  closeDialog() {
    this.visibleDialog = false;
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  getOrdinalSuffix(rank: number): string {
    if (rank === 1) return 'er';
    return 'ème';
  }
  
  demanderActivationCompte(): void {
    this.loading = true;
    this.closeDialog()
    setTimeout(() => {
      // Adjusted payload to use 'chauffeur_id' as required by the API
      this.partenaireService.demanderActivationComptePartenaire({ entreprise_id: this.infoProfile?.entreprise_info?.id }).subscribe(
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
