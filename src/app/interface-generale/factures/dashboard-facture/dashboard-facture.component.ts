import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-facture',
  templateUrl: './dashboard-facture.component.html',
  styleUrls: ['./dashboard-facture.component.css']
})
export class DashboardFactureComponent implements OnInit {

  resultCount = {
    acompte: 0,
    impayer: 0,
    payer: 0,
    annuler: 0,
    total: 0
  };

  breadcrumbItems: MenuItem[] = [];
  constructor(private router: Router,
    private _estimationService: CrmService,) {

  }
  ngOnInit() {

    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Facture' });
    this.breadcrumbItems.push({ label: 'Dashboard' });
    this.loadFactureCounts();
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/factures']);
  }



  navigateWithQuery(query: string): void {
    this.router.navigate(['/app/factures/liste'], { queryParams: { filter: query } });
  }


  loadFactureCounts() {
    this._estimationService.getFactureCounts().subscribe(
      data => {
        this.resultCount = {
          acompte: data.counts_by_type.partiement_regler, // assuming this means partial payments
          impayer: data.counts_by_type.non_regler,        // unpaid
          payer: data.counts_by_type.regler,              // paid
          annuler: data.counts_by_type.annule,            // cancelled
          total: data.total_factures                      // total invoices
        };
      },
      error => {
        console.error('Error fetching facture data', error);
      }
    );
  }

}
