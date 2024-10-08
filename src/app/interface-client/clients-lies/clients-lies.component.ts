import { Component, OnInit } from '@angular/core';
import { CrmService } from '../../utilitaires/services/crm.service';
import { MenuItem, MessageService } from 'primeng/api';

interface StatusTag {
  severity?: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
  value: string;
}

@Component({
  selector: 'app-clients-lies',
  templateUrl: './clients-lies.component.html',
  styleUrls: ['./clients-lies.component.css']
})
export class ClientsLiesComponent implements OnInit {

  breadcrumbItems: MenuItem[] = [];
  selectedClient: any = null;
  detailsDialogVisible: boolean = false;
  clients: any[] = [];
  totalRecords: number = 0;
  first: number = 0;
  rows: number = 10;
  loading: boolean = false;
  messageNoData: string = '';
  items: MenuItem[] = [];

  // Variables pour gérer les réservations ou factures d'un client spécifique
  selectedClientReservations: any[] = [];
  selectedClientFactures: any[] = [];
  displayReservationsDialog: boolean = false;
  displayFacturesDialog: boolean = false;
  dialogTotalRecords: number = 0;
  dialogFirst: number = 0;
  dialogRows: number = 10;

  // Variables pour le dialogue de confirmation
  confirmationVisible: boolean = false;
  confirmationMessage: string = '';
  action: string = '';


  constructor(private clientsLiesService: CrmService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Clients' });
    this.breadcrumbItems.push({ label: 'Collaborateurs/Agents' });
    this.getClientsLies();
  }

  getClientsLies(page: number = 1): void {
    this.clientsLiesService.getClientsLies(page, this.rows).subscribe({
      next: (data) => {
        this.totalRecords = data.count;
        this.clients = data.results.map((client: any) => {
          client.items = this.getMenus(client);
          return client;
        });
        this.clients = data.results;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getMenus(client: any): MenuItem[] {
    return [
      { label: 'Dissocier Ce compte', command: () => this.confirmDissociation(client) },
      { label: client.is_active ? 'Désactiver ce compte' : 'Activer ce compte', command: () => this.confirmAction(client) }
    ];
  }

  confirmDissociation(client: any): void {
    this.selectedClient = client;
    this.action = 'dissocier';
    this.confirmationMessage = `Voulez-vous vraiment dissocier ce compte ?`;
    this.confirmationVisible = true;
  }

  confirmAction(client: any): void {
    this.selectedClient = client;
    this.action = client.is_active ? 'désactiver' : 'activer';
    this.confirmationMessage = `Voulez-vous vraiment ${this.action} ce compte ?`;
    this.confirmationVisible = true;
  }

  executeAction(): void {
    this.confirmationVisible = false;
    this.loading = true;

    if (this.action === 'dissocier') {
      this.gererAssociationClient(this.selectedClient.id, 'dissocier');
    } else if (this.action === 'associer') {
      this.gererAssociationClient(this.selectedClient.id, 'associer', 'cle-exemple');
    } else {
      this.onToggleAccountStatus(this.selectedClient.id);
    }
  }

  gererAssociationClient(clientId: number, action: 'associer' | 'dissocier', cle?: string): void {
    this.clientsLiesService.gererAssociationClient(clientId, action, cle).subscribe({
      next: (response) => {
        this.loading = false;
        const successMessage = `Le compte a été ${action === 'dissocier' ? 'dissocié' : 'associé'} avec succès.`;
        this.showSuccess(successMessage);
        this.getClientsLies(1);
      },
      error: (error) => {
        this.loading = false;
        this.showError(`Erreur lors de l'association ou dissociation du compte.`);
      }
    });
  }

  onToggleAccountStatus(userId: number): void {
    this.clientsLiesService.toggleClientAccountStatus(userId).subscribe({
      next: (response) => {
        this.loading = false;
        const successMessage = `Le compte a été ${this.action} avec succès.`;
        this.selectedClient.is_active = !this.selectedClient.is_active;
        this.showSuccess(successMessage);
        this.getClientsLies(1);
      },
      error: (error) => {
        this.loading = false;
        this.showError('Erreur lors de l\'activation ou désactivation du compte.');
      }
    });
  }


  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 3000 });
  }

  // Toast d'erreur
  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 3000 });
  }

  onPageChange(event: any) {
    this.first = event.first;
    const currentPage = (event.first / event.rows) + 1;
    this.getClientsLies(currentPage);
  }

  getClientImage(): string {
    return "assets/layout/images/avats/avatar7.png";
  }

  formatClientType(type: string): string {
    switch (type) {
      case "client_liee_societe":
        return "Client Lié à Société";
      case "client_liee_agence":
        return "Client Lié à Agence";
      default:
        return "Type Inconnu";
    }
  }

  showDetails(client: any) {
    this.selectedClient = client;
    this.detailsDialogVisible = true;
    this.selectedClientReservations = client.reservations_pagination.results;
    this.selectedClientFactures = client.factures_pagination.results;
  }

  // Ouvrir le dialogue pour les réservations d'un client spécifique
  showReservations(client: any): void {
    this.displayReservationsDialog = true;
    this.dialogTotalRecords = client.reservations_pagination.count;

  }

  // Ouvrir le dialogue pour les factures d'un client spécifique
  showFactures(client: any): void {
    this.displayFacturesDialog = true;
    this.dialogTotalRecords = client.factures_pagination.count;

  }

  // Pagination pour les réservations ou factures
  onDialogPageChange(event: any): void {
    const currentPage = (event.first / event.rows) + 1;
    this.dialogFirst = event.first;
  }

  // Fermer le dialogue des réservations
  closeReservationsDialog(): void {
    this.displayReservationsDialog = false;
  }

  // Fermer le dialogue des factures
  closeFacturesDialog(): void {
    this.displayFacturesDialog = false;
  }

  getRibbonText(statutFacturation: string): string {
    switch (statutFacturation) {
      case 'pas_facture':
        return 'Non Facturé';
      case 'facture_demandee':
        return 'Facture Demandée';
      case 'facture':
        return 'Facturé';
      default:
        return '';
    }
  }

  getAnnulationRibbonText(statutAnnulation: string): string {
    switch (statutAnnulation) {
      case 'demande_annulation':
        return 'Demande d\'Annulation';
      case 'annule':
        return 'Annulé';
      default:
        return 'verifcation';
    }
  }

  getTagSeverity(statut: string, type: 'facturation' | 'annulation'): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    if (type === 'facturation') {
      switch (statut) {
        case 'pas_facture':
          return 'danger';
        case 'facture_demandee':
          return 'warning';
        case 'facture':
          return 'success';
        default:
          return undefined;
      }
    } else if (type === 'annulation') {
      switch (statut) {
        case 'demande_annulation':
          return 'warning';
        case 'annule':
          return 'danger';
        default:
          return undefined;
      }
    } else {
      return undefined;
    }
  }

  getStatusTag(reservation: any): StatusTag {
    if (!reservation.etat) {
      return { severity: 'danger', value: 'Annulé' };
    }

    let severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined;
    switch (reservation.statutReservation) {
      case 'en_attente':
      case 'non_affecter':
        severity = 'danger';
        break;
      case 'terminer':
        severity = 'success';
        break;
      case 'affecter_a_chauffeur':
        severity = 'info';
        break;
      case 'en_traitement':
        severity = 'secondary';
        break;
      case 'affecter_a_partenaire':
        severity = 'info';
        break;
      case 'chauffeur_notifier':
        severity = 'warning';
        break;
      case 'en_cours':
        severity = undefined; // Pas de severity pour "en_cours"
        break;
      default:
        severity = 'contrast';
    }

    return { severity, value: this.getFormattedStatus(reservation.statutReservation) };
  }

  getCardClasses(reservation: any): string {
    switch (reservation.statutReservation) {
      case 'en_attente':
      case 'non_affecter':
        return 'bg-label-danger text-white';
      case 'terminer':
        return 'bg-label-success text-white';
      case 'affecter_a_chauffeur':
        return 'bg-label-info text-white';
      case 'en_traitement':
        return 'bg-label-secondary text-white';
      case 'affecter_a_partenaire':
        return 'bg-label-info text-white';
      case 'chauffeur_notifier':
        return 'bg-label-warning text-dark';
      case 'en_approche':
        return 'bg-label-white text-dark';
      case 'en_cours':
        return 'bg-label-primary text-white';
      default:
        return '';
    }
  }

  getFormattedStatus(status: string): string {
    switch (status) {
      case 'en_attente':
        return 'En Attente';
      case 'en_traitement':
        return 'En Traitement';
      case 'affecter_a_chauffeur':
        return 'Affecté à Chauffeur';
      case 'affecter_a_partenaire':
        return 'Affecté à Partenaire';
      case 'non_affecter':
        return 'Non Affecté';
      case 'chauffeur_notifier':
        return 'Chauffeur Notifié';
      case 'confirmer':
        return 'Confirmé';
      case 'en_cours':
        return 'En Cours';
      case 'terminer':
        return 'Terminé';
      default:
        return status; // Retourne le statut original si non reconnu
    }
  }

  factureGetStatusTag(facture: any): { severity: 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast', value: string } {
    switch (facture.type_facture) {
      case 'non_regler':
        return { severity: 'danger', value: 'Non réglée' };
      case 'regler':
        return { severity: 'success', value: 'Réglée' };
      case 'partiement_regler':
        return { severity: 'warning', value: 'Partiellement réglée' };
      case 'annule':
        return { severity: 'info', value: 'Annulée' };
      default:
        return { severity: 'secondary', value: 'Inconnu' };
    }
  }

}
