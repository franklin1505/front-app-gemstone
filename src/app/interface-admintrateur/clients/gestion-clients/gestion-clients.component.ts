import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
declare const google: any;

@Component({
  selector: 'app-gestion-clients',
  templateUrl: './gestion-clients.component.html',
  styleUrls: ['./gestion-clients.component.css']
})
export class GestionClientsComponent implements OnInit {

  clientForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  loading: boolean = false;
  clientId: any;
  typeClientOptions: { label: string, value: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router,
    private crmService: CrmService,
  ) {
    this.clientForm = this.fb.group({
      type_utilisateur: ['client', Validators.required],
      type_client: ['client_simple', Validators.required],
      is_complete: [true],
      first_name: [''],
      last_name: [''],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      adresse: [''],
      cle_agence: [''],
      cle_societe: [''],
      nom_societe: [''],
      adresse_societe: [''],
      email_societe: [''],
      telephone_societe: [''],
      nom_agence: [''],
      adresse_agence: [''],
      email_agence: [''],
      telephone_agence: ['']
    });

    this.setValidators('client_simple');
    this.initializeTypeClientOptions();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.clientId = +params['id'];
      if (this.clientId) {
        this.loadClientDetails();
      }
    });
  }

  initializeTypeClientOptions(): void {
    const clientTypes = ['client_simple', 'client_liee_agence', 'client_liee_societe', 'client_societe', 'client_agence'];
    this.typeClientOptions = clientTypes.map(type => ({
      label: this.getFormattedClientType(type),
      value: type
    }));
  }

  loadClientDetails(): void {
    this.crmService.getClientsDetails(this.clientId).subscribe((data) => {
      this.clientForm.patchValue(data);
      this.setValidators(data.type_client);

      // Adjust fields based on client type
      if (data.type_client === 'client_agence') {
        this.clientForm.patchValue({
          nom_agence: data.last_name,
          email_agence: data.email,
          adresse_agence: data.adresse,
          telephone_agence: data.telephone
        });
      } else if (data.type_client === 'client_societe') {
        this.clientForm.patchValue({
          nom_societe: data.last_name,
          email_societe: data.email,
          adresse_societe: data.adresse,
          telephone_societe: data.telephone
        });
      }
    });
  }


  onTypeClientChange(event: any): void {
    const selectedType = event.value;
    this.clientForm.get('type_client')?.setValue(selectedType);
    this.setValidators(selectedType);
  }

  setValidators(typeClient: string): void {
    if (typeClient === 'client_simple' || typeClient === 'client_liee_agence' || typeClient === 'client_liee_societe') {
      this.clientForm.get('first_name')?.setValidators([Validators.required]);
      this.clientForm.get('last_name')?.setValidators([Validators.required]);
      this.clientForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.clientForm.get('telephone')?.setValidators([Validators.required]);
      this.clientForm.get('adresse')?.setValidators([Validators.required]);
      this.clearValidatorsAndResetValues(['cle_agence', 'cle_societe', 'nom_societe', 'adresse_societe', 'email_societe', 'telephone_societe', 'nom_agence', 'adresse_agence', 'email_agence', 'telephone_agence']);
    } else if (typeClient === 'client_societe') {
      this.clientForm.get('nom_societe')?.setValidators([Validators.required]);
      this.clientForm.get('adresse_societe')?.setValidators([Validators.required]);
      this.clientForm.get('email_societe')?.setValidators([Validators.required, Validators.email]);
      this.clientForm.get('telephone_societe')?.setValidators([Validators.required]);
      this.clearValidatorsAndResetValues(['first_name', 'last_name', 'email', 'telephone', 'adresse', 'cle_agence', 'cle_societe', 'nom_agence', 'adresse_agence', 'email_agence', 'telephone_agence']);
    } else if (typeClient === 'client_agence') {
      this.clientForm.get('nom_agence')?.setValidators([Validators.required]);
      this.clientForm.get('adresse_agence')?.setValidators([Validators.required]);
      this.clientForm.get('email_agence')?.setValidators([Validators.required, Validators.email]);
      this.clientForm.get('telephone_agence')?.setValidators([Validators.required]);
      this.clearValidatorsAndResetValues(['first_name', 'last_name', 'email', 'telephone', 'adresse', 'cle_agence', 'cle_societe', 'nom_societe', 'adresse_societe', 'email_societe', 'telephone_societe']);
    }

    this.clientForm.updateValueAndValidity();
  }

  clearValidatorsAndResetValues(fields: string[]): void {
    fields.forEach(field => {
      const control = this.clientForm.get(field);
      control?.clearValidators();
      control?.reset();
      control?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      const formData = this.clientForm.value;
      console.log(formData)
      if (this.clientId) {
        this.loading = true;
        setTimeout(() => {
          this.crmService.updateClient(this.clientId, formData).subscribe(
            (data) => {
              this.successMessage = 'Client mis à jour avec succès.';
              this.showSuccess(this.successMessage);
              this.router.navigate(['/app/clients']);
              this.loading = false;
            },
            (error) => {
              this.errorMessage = 'Erreur lors de la mise à jour du client: ' + error.message;
              this.showError(this.errorMessage);
              this.loading = false;
            }
          );
        }, 1500);
      } else {
        // Create new client
        this.registerCompleteAccount(formData);
      }
    } else {
      console.log('Formulaire invalide');
    }
  }

  private registerCompleteAccount(formData: any): void {
    this.loading = true;
    setTimeout(() => {
      this.crmService.registerUser(formData).subscribe({
        next: (response) => {
          console.log(response);
          this.loading = false;
          this.successMessage = 'Client enregistré avec succès.';
          this.showSuccess(this.successMessage);
          this.router.navigate(['/app/clients']);
          this.clientForm.reset();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Erreur lors de l\'enregistrement du client ';
          this.showError(this.errorMessage);
          console.error(error)
        }
      });
    }, 1500);
  }

  initAutocomplete() {
    const typeClient = this.clientForm.get('type_client')?.value;

    let addressField = '';
    if (typeClient === 'client_societe') {
      addressField = 'adresse_societe';
    } else if (typeClient === 'client_agence') {
      addressField = 'adresse_agence';
    } else {
      addressField = 'adresse';
    }

    const addressInput = document.getElementById(addressField) as HTMLInputElement;
    if (addressInput) {
      const addressAutocomplete = new google.maps.places.Autocomplete(addressInput, { types: [] });
      addressAutocomplete.addListener('place_changed', () => {
        this.clientForm.patchValue({ [addressField]: addressInput.value });
      });
    }
  }

  getFormattedClientType(type: string): string {
    switch (type) {
      case "client_simple":
        return "Client Simple";
      case "client_societe":
        return "Client Société";
      case "client_agence":
        return "Client Agence";
      case "client_liee_societe":
        return "Client Liée à une Société";
      case "client_liee_agence":
        return "Client Liée à une Agence";
      default:
        return type;
    }
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }
}
