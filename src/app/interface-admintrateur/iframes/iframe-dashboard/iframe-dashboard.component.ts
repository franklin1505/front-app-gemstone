import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { CrmService } from '../../../utilitaires/services/crm.service';

@Component({
  selector: 'app-iframe-dashboard',
  templateUrl: './iframe-dashboard.component.html',
  styleUrls: ['./iframe-dashboard.component.css']
})
export class IframeDashboardComponent implements OnInit {
  visible: boolean = false;
  urlList: any;
  urlPartenaire: string = '';
  urlOps: string = '';
  breadcrumbItems: MenuItem[] = [];
  constructor(
    private route: ActivatedRoute,
    private _reservationService: CrmService
  ) { }

  ngOnInit(): void {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Iframes' });
    this.breadcrumbItems.push({ label: 'Interfaces externes' });
    this.getUrlValues()

  }


  getUrlValues(): void {
    this._reservationService.getAllUrls().subscribe(
      (response) => {
        this.urlList = response;
        // Assurez-vous que response contient les données attendues de votre API
        if (this.urlList.length > 0) {
          // Supposons que vous utilisez le premier élément de la liste comme exemple
          this.urlOps = this.urlList[0].url_operateur + 'moduleDeReservation' || '';
          this.urlPartenaire = this.urlList[0].url_partenaire || ''; // Utilisation de url_partenaire si défini
        }
        console.log(response);
      },
      (error) => {
        console.error('Error fetching urls values:', error);
      }
    );
  }
  get iframeCode(): string {
    return `&lt;iframe src="${this.urlOps}" width="100%" style="height: 100vh; border: none; margin: 0; padding: 0; display: block;"&gt;&lt;/iframe&gt;`;
  }

  showDialog() {
    this.visible = true;
  }

}
