import { Component, OnInit } from '@angular/core';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-view-client',
  templateUrl: './view-client.component.html',
  styleUrl: './view-client.component.scss'
})
export class ViewClientComponent implements OnInit {
  selectedClient: any = null;
  successMessage!: string;
  errorMessage!: string;
  detailsDialogVisible: boolean = false;
  visible: boolean = false;
  clients: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  currentClientType: string = '';
  breadcrumbItems: MenuItem[] = [];
  loading: boolean = false;
  rows: number = 10; // Nombre d'éléments par page
  first: number = 0; // Indice de la première page
  totalRecords: number = 0; // Nombre total d'enregistrements

  items!: MenuItem[];
  filterOptions: { key: string; description: string }[] = [
    { key: "type_client", description: "Filtrer par type de client" },
    { key: "association_key", description: "Filtrer par clé d'association" },
    { key: "societe", description: "Filtrer par société" },
    { key: "agence", description: "Filtrer par agence" },
    { key: "first_name", description: "Filtrer par prénom" },
    { key: "last_name", description: "Filtrer par nom" },
    { key: "email", description: "Filtrer par email" },
    { key: "telephone", description: "Filtrer par téléphone" }
  ];

  filterItems: SelectItem[] = [];
  selectedFilterKey: string = '';
  filterValue: string = '';

  constructor(
    private clientListService: CrmService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {
    this.filterItems = this.filterOptions.map(option => ({
      label: option.description,
      value: option.key
    }));
  }

  ngOnInit(): void {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Clients' });

    // Récupérer le type_client à partir des query parameters
    this.route.queryParams.subscribe((params) => {
      this.currentClientType = params['type_client'] || 'client_simple'; // valeur par défaut
      this.loadClients(this.currentPage, this.currentClientType);
      this.updateBreadcrumbTitle()
    });
  }

  loadClients(page: number, typeClient: string): void {
    this.clientListService.getClientList(page, typeClient).subscribe(data => {
      console.log(data)
      this.clients = data.results || data; // Adaptation selon la structure de réponse
      this.totalRecords = data.count || data.length; // Adaptation selon la structure de réponse
      this.currentPage = page;
      this.totalPages = Math.ceil(this.totalRecords / this.rows); // Calcul du nombre de pages
    }, error => {
      console.error('Erreur lors de la récupération des clients:', error);
    });
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/clients']);
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
        return "assets/layout/images/avats/2.png"; // Ajustez si nécessaire
      case "client_liee_agence":
        return "assets/layout/images/avats/4.png"; // Ajustez si nécessaire
      default:
        return "assets/layout/images/avats/avatar7.png"; // Valeur par défaut
    }
  }

  updateBreadcrumbTitle(): void {
    switch (this.currentClientType) {
      case 'client_simple':
        this.breadcrumbItems.push({ label: 'Client Simple' });
        break;
      case 'client_societe':
        this.breadcrumbItems.push({ label: 'Client Société' });
        break;
      case 'client_agence':
        this.breadcrumbItems.push({ label: 'Client Agence' });
        break;
      case 'client_liee_societe':
        this.breadcrumbItems.push({ label: 'Client Lié à une Société' });
        break;
      case 'client_liee_agence':
        this.breadcrumbItems.push({ label: 'Client Lié à une Agence' });
        break;
      default:
        this.breadcrumbItems.push({ label: 'Tous les Clients' });
    }
  }

  showDetails(client: any) {
    this.selectedClient = client;
    this.detailsDialogVisible = true;
  }

  showDialog() {
    this.visible = true;
  }

  formatClientType(type: string): string {
    switch (type) {
      case "client_simple":
        return "Client Simple";
      case "client_societe":
        return "Société";
      case "client_agence":
        return "Agence";
      case "client_liee_societe":
        return "Client Lié à Société";
      case "client_liee_agence":
        return "Client Lié à Agence";
      default:
        return "Type Inconnu";
    }
  }

  getClientsFiltre(page: number = 1, rows: number = 20): void {
    if (this.selectedFilterKey && this.filterValue) {
      const filterParams = {
        [this.selectedFilterKey]: this.filterValue,
      };

      console.log('Filtering clients with params:', filterParams);

      this.clientListService.getClientsFiltre(filterParams, page, rows).subscribe(
        (response: any) => {
          console.log('response filtrage', response)
          this.clients = response; // Ensure 'results' is the key in the paginated response
          this.currentPage = page;
          this.totalPages = Math.ceil(response.count / rows); // Update total number of pages
        },
        (error) => {
          console.error("Error fetching filtered clients", error);
        }
      );
    }
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first || 0;
    this.rows = event.rows || 10;
    const page = (event.page !== undefined ? event.page : this.first / this.rows) + 1;

    if (this.filterValue) {
      // If a filter is applied, call the filtering method with pagination
      this.getClientsFiltre(page, this.rows);
    } else {
      // Otherwise, retrieve clients with pagination
      this.loadClients(page, this.currentClientType);
    }
  }

  delete(client: any): void {
    this.clientListService.deleteClient(client.id).subscribe({
      next: (res) => {
        this.loading = true;

        setTimeout(() => {
          console.log('Le client est supprimé avec succès', client);
          this.successMessage = 'Le client est supprimé avec succès';
          this.showSuccess(this.successMessage);
          this.loading = false;
          this.loadClients(this.currentPage, this.currentClientType);
        }, 1500);
      },
      error: (e) => {
        console.error(e)
        this.errorMessage = 'une erreur est surveunu lors de la supression du compte du client'
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
}
