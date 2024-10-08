import { Component, OnInit } from '@angular/core';
import { CrmService } from '../../utilitaires/services/crm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-le-marché',
  templateUrl: './le-marché.component.html',
  styleUrls: ['./le-marché.component.css']
})
export class LeMarchéComponent implements OnInit {

  infoProfile: any;

  breadcrumbItems: MenuItem[] = [];

  constructor(
    private chauffeurService: CrmService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Chauffeur' });
    this.breadcrumbItems.push({ label: 'Le marché' });
    this.getProfil()
  }

  getProfil(page: number = 1) {
    this.chauffeurService.getChauffeurProfile(page).subscribe({
      next: (data) => {
        this.infoProfile = data.results;
        console.log(data);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getLogoUrl(photoFileName: string): string {
    if (photoFileName) {
      return `${environment.Url}${photoFileName}`;
    } else {
      return '/assets/demo/images/avatar7.png';
    }
  }
}
