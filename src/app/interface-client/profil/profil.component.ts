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

  confirmationVisible = false;
  confirmationMessage = '';
  action: 'associer' | 'dissocier' = 'associer';  // Initialisation de action
  cle: string = '';
  cleDialogVisible = false;
  breadcrumbItems: MenuItem[] = [];
  infoProfile: any;
  loading: boolean = false;

  constructor(
    private clientService: CrmService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Chauffeur' });
    this.breadcrumbItems.push({ label: 'Profil' });
    this.getProfil();
  }

  getProfil() {
    this.clientService.getClientProfile().subscribe({
      next: (data) => {
        this.infoProfile = data;
        this.determineAction();
        console.log(this.infoProfile)
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getClientImage(type: string): string {
    switch (type) {
      case "client_simple":
        return "assets/layout/images/avats/avatar7.png";
      case "client_societe":
        return "assets/layout/images/avats/3.png";
      case "client_agence":
        return "assets/layout/images/avats/1.png";
      case "client_liee_societe":
        return "assets/layout/images/avats/2.png";
      case "client_liee_agence":
        return "assets/layout/images/avats/4.png";
      default:
        return "assets/layout/images/avats/avatar7.png";
    }
  }

  getFormattedClientType(type: string): string {
    switch (type) {
      case "client_simple":
        return "Client Simple";
      case "client_societe":
        return "Client Société";
      case "client_agence":
        return "Client Agence";
      case "client_liee_societe":
        return "Client Liée à une Société";
      case "client_liee_agence":
        return "Client Liée à une Agence";
      default:
        return type;
    }
  }

  openCleDialog(): void {
    this.determineAction();  // S'assure que l'action correcte est définie

    if (this.action === 'associer') {
      this.cleDialogVisible = true;  // Ouvrir le dialogue pour la clé
    } else if (this.action === 'dissocier') {
      this.openConfirmationDialog();  // Aller directement à la confirmation pour dissocier
    }
  }


  determineAction(): void {
    const typeClient = this.infoProfile?.client_info?.type_client;
    if (typeClient === 'client_simple') {
      this.action = 'associer';
    } else if (typeClient === 'client_liee_agence' || typeClient === 'client_liee_societe') {
      this.action = 'dissocier';
    }
  }

  shouldShowButton(): boolean {
    const typeClient = this.infoProfile?.client_info?.type_client;
    return typeClient !== 'client_agence' && typeClient !== 'client_societe';
  }

  validateCle(): void {
    if (this.cle) {
      this.cleDialogVisible = false;
      this.openConfirmationDialog();
    } else {
      this.showError('Veuillez entrer une clé valide.');
    }
  }

  openConfirmationDialog(): void {
    this.confirmationMessage = `Voulez-vous vraiment ${this.action} ce client ?`;
    this.confirmationVisible = true;
  }

  executeAssociationOrDissociation(): void {
    this.confirmationVisible = false;
    this.loading = true;

    if (this.action === 'associer') {
      this.clientService.gererAssociationClient(this.infoProfile?.client_info?.id, 'associer', this.cle).subscribe({
        next: (response) => {
          this.loading = false;
          this.showSuccess('Le client a été associé avec succès.');
          this.getProfil();
        },
        error: (error) => {
          this.loading = false;
          this.showError('Erreur lors de l\'association du client.');
        }
      });
    } else {
      this.clientService.gererAssociationClient(this.infoProfile?.client_info?.id, 'dissocier').subscribe({
        next: (response) => {
          this.loading = false;
          this.showSuccess('Le client a été dissocié avec succès.');
          this.getProfil();
        },
        error: (error) => {
          this.loading = false;
          this.showError('Erreur lors de la dissociation du client.');
        }
      });
    }
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 3000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 3000 });
  }
}
