import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Methode } from '../../../utilitaires/models/parametres';

@Component({
  selector: 'app-parametres-dashboard',
  templateUrl: './parametres-dashboard.component.html',
  styleUrls: ['./parametres-dashboard.component.css']
})
export class ParametresDashboardComponent implements OnInit {

  visible: boolean = false
  defaultMethodNames = ['payement_abord', 'payement_virement', 'payement_paypal', 'payement_stripe', 'payment_en_compte'];
  @ViewChild('vehiclesMenu') vehiclesMenu!: OverlayPanel;
  @ViewChild('chauffeursMenu') chauffeursMenu!: OverlayPanel;
  detailsDialogVisible: boolean = false;

  successMessage!: string;
  errorMessage !: string;

  parametreEnCours: boolean = false;

  typeEntreprise = 'mon_entreprise';



  breadcrumbItems: MenuItem[] = [];
  items: MenuItem[] | undefined;



  dialogVisible: boolean = false;
  selectedParametres: any = null;
  dialogType: string = '';

  // Initialise all lists
  parametresList: any[] = [];
  urlList: any[] = [];
  apiList: any[] = [];
  typeVehiculeList: any[] = [];
  codeList: any[] = [];
  virementList: any[] = [];
  paypalList: any[] = [];
  ConfigFactureList: any[] = [];
  ConfigDevisList: any[] = [];
  attributList: any[] = [];
  modeList: any[] = [];
  stripeList: any[] = [];
  serviceClientList: any[] = [];
  showClientId: boolean = false;
  showApiKey: boolean = false;
  showClientSecret: boolean = false;
  showPassStandard: boolean = false;
  showPassAdmin: boolean = false;
  selectedSection: string = 'configuration';
  loading: boolean = false;
  entrepriseList: any[] = [];;

  @HostListener('window:beforeunload', ['$event'])
  intercepteRafraichissement($event: any): void {
    if (this.parametreEnCours) {
      $event.returnValue = true;
    }
  }

  constructor(private _parametresService: CrmService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Paramètres' });
    this.breadcrumbItems.push({ label: 'Configurations' });
    this.getEntreprise();
    this.getCodeValues();
    this.getParamMenu();
  }

  getParamMenu() {
    this.items = [
      { label: 'Configuration', icon: 'pi pi-cog', command: () => this.displaySection('configuration') },
      { label: 'Détails Bancaires', icon: 'pi pi-credit-card', command: () => this.displaySection('details-bancaires') },
      { label: 'Moyens de Paiement', icon: 'pi pi-wallet', command: () => this.displaySection('moyens-de-paiement') },
    ];
  }

  displaySection(section: string) {
    this.loading = true
    setTimeout(() => {
      this.loading = false
      this.selectedSection = section;
    }, 1000);
  }

  getCodeValues(): void {
    this._parametresService.getAllCodeVerification().subscribe(
      (response) => {
        this.codeList = response
      },
      (error) => {
        console.error('Error fetching code values:', error);
      }
    );
  }

  getEntreprise(): void {
    this.loading = true
    this._parametresService.getMonEntreprises().subscribe((data: any) => {
      this.loading = false
      this.entrepriseList = data
      this.getParametres();
      this.getApi();
      this.getAttribut();
      this.getUrlValues();
      this.getTypeVehicule();
      this.getConfigFacture();
      this.getConfigDevis();
      this.getVirement();
      this.getPaypal();
      this.getStripe();
      this.getPayement();
      this.getServiceClient();
    });
  }

  getParametres(): void {
    this._parametresService.getAllParametres().subscribe((data: any[]) => {
      this.parametresList = data;
    });
  }

  getConfigDevis(): void {
    this._parametresService.getAllConfigDevis().subscribe((data: any[]) => {
      this.ConfigDevisList = data;
    });
  }
  getConfigFacture(): void {
    this._parametresService.getAllConfigFacture().subscribe((data: any[]) => {
      this.ConfigFactureList = data;
    });
  }

  getUrlValues(): void {
    this._parametresService.getAllUrls().subscribe(
      (response) => {
        this.urlList = response
      },
      (error) => {
        console.error('Error fetching urls values:', error);
      }
    );
  }

  getApi(): void {
    this._parametresService.getAllApi().subscribe((data) => {
      this.apiList = data;
    });
  }

  getPayement(): void {
    this._parametresService.getAllMethodePayement().subscribe((data) => {
      this.modeList = data;
    });
  }


  toggleMethodeActive(methode: Methode) {
    const oldValue = methode.is_active;
    methode.is_active = !methode.is_active;
    this.updateMethodeAttribute('is_active', methode, oldValue);
  }


  updateMethodeAttribute(attributeName: keyof Methode, methode: Methode, oldValue: boolean) {
    if (methode.id !== undefined) {
      this._parametresService.updateMethodeActive(methode.id, { is_active: methode.is_active }).subscribe(
        (updatedMethode) => {
          const attributeLabel = this.formatPaymentMethodName(attributeName as string);
          if (updatedMethode[attributeName]) {
            this.successMessage = `La méthode de paiement à été activé.`;
          } else {
            this.successMessage = `La méthode de paiement à été désactivé.`;
          }
          this.showSuccess(this.successMessage);
        },
        (error) => {
          console.error(`Erreur lors de l'activation/désactivation de l'attribut ${attributeName}: `, error);
          // Rétablissez la valeur précédente en cas d'erreur
          this.errorMessage = `Erreur lors de l'activation/désactivation de l'attribut ${attributeName}: ${error.message}`;
          (methode as any)[attributeName] = oldValue;
          this.showError(this.errorMessage)
        }
      );
    } else {
      console.error('ID du mode de paiement non défini.');
      // Rétablissez la valeur précédente en cas d'erreur
      (methode as any)[attributeName] = oldValue;
    }
  }

  isCustomMethode(methode: Methode): boolean {
    return !this.defaultMethodNames.includes(methode.nom);
  }

  formatPaymentMethodName(method: string): string {
    switch (method) {
      case 'payement_paypal':
        return 'Paiement par PayPal';
      case 'payement_stripe':
        return 'Paiement par Stripe';
      case 'payement_abord':
        return 'Paiement à bord (espèce ou CB)';
      case 'payement_virement':
        return 'Paiement par virement bancaire';
      case 'payment_en_compte':
        return 'Paiement en compte';
      default:
        return method;
    }
  }

  getAttribut(): void {
    this._parametresService.getAllAttribut().subscribe((data: any[]) => {
      this.attributList = data;
      this.attributList.forEach((attribut) => {
        attribut.entreprise = this.entrepriseList.find(
          (entreprise) => entreprise.id === attribut.entreprise
        );
        attribut.entreprise = attribut.entreprise ? attribut.entreprise.nom : '';
      });
    });
  }

  getVirement(): void {
    this._parametresService.getAllVirement().subscribe((data) => {
      this.virementList = data;
    });
  }
  getPaypal(): void {
    this._parametresService.getAllPaypal().subscribe((data) => {
      this.paypalList = data;
    });
  }
  getStripe(): void {
    this._parametresService.getAllStripe().subscribe((data) => {
      this.stripeList = data;
    });
  }

  getServiceClient(): void {
    this._parametresService.getServiceClients().subscribe((data) => {
      this.serviceClientList = data;
      console.log(data)
    });
  }

  getTypeVehicule(): void {
    this._parametresService.getAllTypeVehicule().subscribe((data: any[]) => {
      this.typeVehiculeList = data;
      this.typeVehiculeList.forEach((type) => {
        type.entreprise = this.entrepriseList.find(
          (entreprise) => entreprise.id === type.entreprise
        );
        type.entreprise = type.entreprise ? type.entreprise.nom : '';
      });
    });
  }

  getLogoUrl(logoFileName: string): string {
    if (logoFileName) {
      return logoFileName;
    } else {
      return '/assets/demo/images/logo.jpg';
    }
  }

  showMenu(event: Event, menu: string) {
    switch (menu) {

      case 'vehiclesMenu':
        this.vehiclesMenu.toggle(event);
        break;
      case 'chauffeursMenu':
        this.chauffeursMenu.toggle(event);
        break;
      default:
        break;
    }
  }
 showDialog(type: 'details') {
    switch (type) {
      case 'details':
        this.detailsDialogVisible = true;
        break;
    }
  }

  toggleVisibility(field: string) {
    if (field === 'clientId') {
      this.showClientId = !this.showClientId;
    } else if (field === 'clientSecret') {
      this.showClientSecret = !this.showClientSecret;
    } if (field === 'standard') {
      this.showPassStandard = !this.showPassStandard;
    } if (field === 'admin') {
      this.showPassAdmin = !this.showPassAdmin;
    }if (field === 'apiKey') {
      this.showApiKey = !this.showApiKey;
    }
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }

  showAddVehiculeDialog: boolean = false;
  selectedEntrepriseId: number | null = null;

  openAddVehiculeDialog(entrepriseId: number): void {
    this.selectedEntrepriseId = entrepriseId;
    this.showAddVehiculeDialog = true;
  }

  handleDialogClose() {
    this.showAddVehiculeDialog = false;
  }

  openDialog(parametres: any, type: string) {
    this.selectedParametres = parametres;
    this.dialogType = type;
    this.dialogVisible = true;
  }

  delete(id: any): void {
    if (this.attributList) {
      this.loading = true
      setTimeout(() => {
        this._parametresService.deleteAttribut(id).subscribe({
          next: () => {
            this.loading = false
            this.showSuccess('Le supplément a été supprimé avec succès');
            this.getEntreprise()
          },
          error: (e) => {
            this.loading = false
            console.error(e)
          }
        });
      }, 1500);
    } else {
      console.error('Impossible de supprimer la donnée : ID non valide');
    }
  }

  delete2(id: any): void {
    if (this.attributList) {
      this.loading = true
      setTimeout(() => {
        this._parametresService.deleteTypeVehicule(id).subscribe({
          next: () => {
            this.loading = false
            this.showSuccess('Le type de véhicule a été supprimé avec succès');
            this.getEntreprise()
          },
          error: (e) => {
            this.loading = false
            console.error(e)
          }
        });
      }, 1500);
    } else {
      console.error('Impossible de supprimer la donnée : ID non valide');
    }
  }

  delete_id: any;
  delete_type: any;

  open(id: any, type: any) {
    this.visible = true;
    this.delete_id = id;
    this.delete_type = type;
  }

  validate(action: any) {
    if (action === 'oui') {
      if (this.delete_type === 'deleteAttribut') {
        this.delete(this.delete_id);
      } else if (this.delete_type === 'deleteTypeVehicule') {
        this.delete2(this.delete_id);
      } else {
        console.warn('Type de suppression non reconnu :', this.delete_type);
      }
    } else {
      this.showError('Suppression de la donnée annulé')
    }
    this.resetDeleteState();
  }

  resetDeleteState() {
    this.visible = false;
    this.delete_id = null;
    this.delete_type = null;
  }

}

