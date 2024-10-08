import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { WebsocketService } from '../../../utilitaires/services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboardResevations',
  templateUrl: './dashboardResevations.component.html',
  styleUrls: ['./dashboardResevations.component.css']
})
export class DashboardResevationsComponent implements OnInit {

  breadcrumbItems: MenuItem[] = [];
  userType: string | null = null;
  resultCount: { beforeToday: number; reglees_count: number; non_reglees_count: number; today: number; afterToday: number; cancelled: number; archived: number; total: number; }
    = { beforeToday: 0, archived: 0, today: 0, total: 0, afterToday: 0, cancelled: 0, reglees_count: 0, non_reglees_count: 0, };

  constructor(private router: Router,
    private _estimationService: CrmService,) {

  }

  ngOnInit() {
    this.userType = this._estimationService.getUserType();
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Reservations' });
    this.breadcrumbItems.push({ label: 'Dashboard' });
    this.getCalculateCounts();
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/reservations']);
  }

  getCalculateCounts(): void {
    this._estimationService.getCalculateCounts().subscribe((data: any) => {
      this.resultCount = data;
      console.log('counts', this.resultCount)
    });
  }

    navigateWithQuery(query: string): void {
    this.router.navigate(['/app/reservations/liste'], { queryParams: { filter: query } });
  }

}
