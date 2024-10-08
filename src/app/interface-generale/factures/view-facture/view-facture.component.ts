import { Component, OnInit } from '@angular/core';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-view-facture',
  templateUrl: './view-facture.component.html',
  styleUrls: ['./view-facture.component.css']
})
export class ViewFactureComponent implements OnInit {

  factures: any[] = [];
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;  // Adjust pageSize to the desired number of records per page
  loading: boolean = false;
  breadcrumbItems: MenuItem[] = [];
  messageNoData: string = '';
  currentInvoiceType: string = '';

  constructor(
    private factureService: CrmService,
    private route: ActivatedRoute,
    private router: Router) { }


    ngOnInit(): void {
      this.breadcrumbItems = [{ label: 'Facture' }];

      this.route.queryParams.subscribe((params: { [x: string]: string }) => {
        this.currentInvoiceType = params['filter'] || 'total_factures';
        this.updateBreadcrumbTitle();
        this.chargerFactures();
      });
    }

    chargerFactures(): void {
      this.loading = true;

      const isTotalFactures = this.currentInvoiceType === 'total_factures';

      this.factureService.getFactures(
          isTotalFactures ? '' : this.currentInvoiceType,
          isTotalFactures,
          this.currentPage,
          this.pageSize
        ).subscribe(
          (response) => {
            this.factures = response.results || [];
            this.totalRecords = response.count || 0;
            this.loading = false;

            if (this.factures.length === 0) {
              this.messageNoData = this.getNoDataMessage();
            }
          },
          (error) => {
            console.error('Error fetching factures', error);
            this.loading = false;
          }
        );
    }

  // Method to update the breadcrumb title and the no-data message
  updateBreadcrumbTitle(): void {
    this.breadcrumbItems = [{ label: 'Facture' }];  // Reset breadcrumb

    switch (this.currentInvoiceType) {
      case 'partiement_regler':
        this.breadcrumbItems.push({ label: 'Factures partiellement réglées' });
        break;
      case 'non_regler':
        this.breadcrumbItems.push({ label: 'Factures impayées' });
        break;
      case 'annule':
        this.breadcrumbItems.push({ label: 'Factures annulées' });
        break;
      case 'regler':
        this.breadcrumbItems.push({ label: 'Factures payées' });
        break;
      case 'total_factures':
      default:
        this.breadcrumbItems.push({ label: 'Toutes les factures' });
        break;
    }
  }

  // Get no-data message based on the current invoice type
  getNoDataMessage(): string {
    switch (this.currentInvoiceType) {
      case 'partiement_regler':
        return "Désolé, pas de factures partiellement réglées 🙂";
      case 'non_regler':
        return "Désolé, pas de factures impayées 🙂";
      case 'annule':
        return "Désolé, pas de factures annulées 🙂";
      case 'regler':
        return "Désolé, pas de factures payées 🙂";
      case 'total_factures':
      default:
        return "Désolé, pas de factures disponibles 🙂";
    }
  }

  // Method to handle pagination change
  onPageChange(event: any): void {
    this.currentPage = event.page + 1;  // PrimeNG paginator is 0-based
    this.pageSize = event.rows;
    this.chargerFactures();  // Reload factures on page change
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/factures']);
  }

  getRibbonText(statutFacturation: string): string {
    switch (statutFacturation) {
      case 'impaye':
        return 'Impayé';
      case 'acompte':
        return 'Acompte';
      case 'payer':
        return 'Payé';
      default:
        return '';
    }
  }

  getFormattedStatus(status: string): string {
    switch (status) {
      case 'impaye':
        return 'Impayé';
      case 'acompte':
        return 'Acompte';
      case 'payer':
        return 'Payé';
      default:
        return status; // Retourne le statut original si non reconnu
    }
  }

  getCardClasses(facture: any): string {
    switch (facture.statutPaiement) {
      case 'impaye':
        return 'bg-label-danger text-white';
      case 'acompte':
        return 'bg-label-warning text-dark';
      case 'payer':
        return 'bg-label-success text-white';
      default:
        return '';
    }
  }

  getStatusTag(facture: any): { severity: 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast', value: string } {
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
