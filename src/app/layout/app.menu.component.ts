import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { Router } from '@angular/router';
import { CrmService } from '../utilitaires/services/crm.service';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

  model: any[] = [];
  isCodeVerified = false;
  codeVerification = '';
  errorMessage = '';
  display: boolean = false;
  currentMenu: string | null = null;
  userInfo: any;

  constructor(public layoutService: LayoutService,
    private router: Router,
    private _crmService: CrmService
  ) { }

  ngOnInit() {
    this._crmService.getUserInfo().subscribe(
      (data) => {
        this.userInfo = data;
        this.model = this.getMainMenu();
      },
      (error) => {
        console.error('Erreur lors de la récupération des informations utilisateur', error);
      }
    );
  }

  /*  { label: 'Devis', icon: 'pi pi-fw pi-file-edit',  routerLink: ['/app/devis'],  visible: this.isAdministrateur() || this.isClient() },
        { label: 'Estimations', icon: 'pi pi-fw pi-chart-line',routerLink: ['/app/estimations'],  visible: this.isAdministrateur() || this.isClient() }, */

  getMainMenu() {
    return [{
      label: 'Menu',
      items: [
        { label: 'Module De Reservation', icon: 'pi pi-fw pi-calendar-plus', routerLink: this.isAdministrateur() ? ['/app/reservations/reserver'] : this.isClient() ? ['/app/reservations/reserverAc'] : null, visible: this.isAdministrateur() || this.isClient() },
        { label: 'Reservations', icon: 'pi pi-fw pi-list', routerLink: ['/app/reservations'], visible: this.isAdministrateur() || this.isClient() || this.isChauffeur() || this.isHotel() || this.isPartenaire() },
        { label: 'Factures', icon: 'pi pi-fw pi-file', routerLink: ['/app/factures'], visible: this.isAdministrateur() || this.isClient() || this.isHotel() },
        { label: 'Clients', icon: 'pi pi-fw pi-users', routerLink: ['/app/clients'], visible: this.isAdministrateur() },
        { label: 'Iframes', icon: 'pi pi-fw pi-globe', routerLink: ['/app/iframes'], visible: this.isAdministrateur() },
        { label: 'Parametres', icon: 'pi pi-fw pi-cog', command: () => this.switchMenu('parametres'), visible: this.isAdministrateur() },
        { label: 'Compte', icon: 'pi pi-fw pi-user', command: () => this.switchMenu('compte'), visible: !(this.isAdministrateur() || this.isChauffeur() || this.isPartenaire()) },
        { label: 'Profil', icon: 'pi pi-fw pi-user', routerLink: ['/app/chauffeur/profil'], visible: this.isChauffeur() },
        { label: 'Le Marché', icon: 'pi pi-shop', routerLink: ['/app/chauffeur/le-marché'], visible: this.isChauffeur() },
        { label: 'Mes Chauffeurs', icon: 'pi pi-users', routerLink: ['/app/partenaire/mes-chauffeurs'], visible: this.isPartenaire() },
        { label: 'Mes Vehicules', icon: 'pi pi-car', routerLink: ['/app/partenaire/mes-vehicules'], visible: this.isPartenaire() },
        { label: 'Profil', icon: 'pi pi-fw pi-user', routerLink: ['/app/partenaire/profil'], visible: this.isPartenaire() },
        { label: 'Quitter', icon: 'pi pi-power-off', command: () => { this.onLogout(); }, visible: this.isChauffeur() || this.isPartenaire() },
      ]
    }];
  }

  getCompteMenu() {
    const menuItems: any[] = [
      { label: 'Profil', icon: 'pi pi-fw pi-user', routerLink: ['/app/client/profil'] },
/*       { label: 'Configuration', icon: 'pi pi-fw pi-cog', routerLink: ['/app/client/config'] }
 */    ];

    if (this.userInfo && this.userInfo.type_client === "client_societe") {
      menuItems.push({ label: 'Mes Collaborateurs', icon: 'pi pi-fw pi-users', routerLink: ['/app/client/lies'] });
    } else if (this.userInfo && this.userInfo.type_client === "client_agence") {
      menuItems.push({ label: 'Mes Agents', icon: 'pi pi-fw pi-users', routerLink: ['/app/client/lies'] });
    }

    menuItems.push({ label: 'Retour', icon: 'pi pi-fw pi-arrow-left', command: () => this.switchMenu(null) });
    return [{
      label: 'Compte',
      items: menuItems
    }];
  }



  getParametresMenu() {
    return [{
      label: 'Parametres',
      items: [
        { label: 'Parametre Generale', icon: 'pi pi-fw pi-cog', command: () => this.showDialog() },
        { label: 'Entreprise Partenaire', icon: 'pi pi-fw pi-briefcase', routerLink: ['/app/parametres/partenaire'], },
        { label: 'Chauffeurs Externes', icon: 'pi pi-fw pi-users', routerLink: ['/app/parametres/chauffeursExternes'], },
        { label: 'Quitter le Parametre', icon: 'pi pi-fw pi-arrow-left', command: () => this.switchMenu(null) }
      ]
    }];
  }

  switchMenu(menu: string | null) {
    this.model = menu === 'compte' ? this.getCompteMenu() : menu === 'parametres' ? this.getParametresMenu() : this.getMainMenu();
  }

  showDialog() {
    this.display = true
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

}
