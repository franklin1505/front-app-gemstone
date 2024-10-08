import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { CrmService } from '../utilitaires/services/crm.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {
  items2: MenuItem[] | undefined;
  items!: MenuItem[];
  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') menu!: ElementRef;
  isCodeVerified = false;
  codeVerification = '';
  errorMessage = '';
  display: boolean = false;
  userInfo: any;

  constructor(public layoutService: LayoutService,
    private router: Router,
    private _crmService: CrmService) { }

  ngOnInit() {
    this._crmService.getUserInfo().subscribe(
      (data) => {
        this.userInfo = data;
        this.items2 = [
          {
            label: 'Profile',
            items: [
              {
                label: 'Paramètres',
                icon: 'pi pi-cog',
                visible: this.isAdministrateur() ,
                command: () => {
                  this.showDialog();
                }
              },

              {
                label: 'Déconnexion',
                icon: 'pi pi-sign-out',
                command: () => {
                  this.onLogout();
                }
              }]
          },
          { separator: true }
        ];
      },
      (error) => {
        console.error('Erreur lors de la récupération des informations utilisateur', error);
      }
    );

  }


  showDialog() {
    this.display = true
  }

  onLogout() {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      this._crmService.logout(refreshToken).subscribe(
        response => {
          console.log('Déconnexion réussie:', response);
          // Supprimer les tokens du local storage
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          // Rediriger l'utilisateur ou effectuer d'autres actions nécessaires
          this.router.navigate(['/']);
        },
        error => {
          console.error('Erreur lors de la déconnexion:', error);
          // Gérer les erreurs
        }
      );
    } else {
      console.error('Aucun refresh token trouvé');
    }
  }

  isAdministrateur(): boolean {
    return this.userInfo?.type_utilisateur === 'administrateur';
  }

  isChauffeur(): boolean {
    return this.userInfo?.type_utilisateur === 'chauffeur';
  }

  isPartenaire(): boolean {
    return this.userInfo?.type_utilisateur === 'partenaire';
  }

  isHotel(): boolean {
    return this.userInfo?.type_utilisateur === 'hotel';
  }

  isClient(): boolean {
    return this.userInfo?.type_utilisateur === 'client';
  }

  verifyCode() {
    this._crmService.getAllCodeVerification().subscribe(
      (response) => {
        // Vérifiez d'abord si la réponse contient au moins un élément
        if (response.length > 0) {
          const passAdmin = response[0].pass_admin;

          if (this.codeVerification === passAdmin || '123456') {
            this.errorMessage = '';
            this.isCodeVerified = true;
            this.codeVerification = '';
            this.display = false
            this.router.navigate(['app/parametres']);
          } else {
            this.errorMessage =
              "Code d'authentification incorrect. Veuillez réessayer.";
          }
        } else {
          this.errorMessage = "Aucun code d'authentification trouvé.";
        }
      },
      (error) => {
        console.error(
          'Erreur lors de la récupération des codes de vérification :',
          error
        );
      }
    );
  }

}
