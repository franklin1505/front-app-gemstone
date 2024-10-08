import { Component, OnInit } from '@angular/core';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-client',
  templateUrl: './dashboard-client.component.html',
  styleUrl: './dashboard-client.component.scss'
})
export class DashboardClientComponent implements OnInit{

  breadcrumbItems: MenuItem[] = [];
  totalCount: number = 0;
  clientCounts: { [key: string]: number } = {};

  constructor(
    private clientCountService: CrmService,
    private router: Router,) { }

  ngOnInit(): void {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Clients' });
    this.breadcrumbItems.push({ label: 'Dashboard' });
    this.clientCountService.getClientCounts().subscribe(data => {
      this.totalCount = data.total_count;
      data.client_counts.forEach((item: any) => {
        this.clientCounts[item.type_client] = item.count;
      });
    });
  }
  navigateToDashboard = () => {
    this.router.navigate(['/app/clients']);
  }

  navigateWithQuery(typeClient: string): void {
    this.router.navigate(['/app/clients/liste'], { queryParams: { type_client: typeClient } });
  }

}
