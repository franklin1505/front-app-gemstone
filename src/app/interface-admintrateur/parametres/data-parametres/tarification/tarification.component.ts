import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrmService } from '../../../../utilitaires/services/crm.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-tarification',
  templateUrl: './tarification.component.html',
  styleUrls: ['./tarification.component.css']
})
export class TarificationComponent implements OnInit {
  loading: boolean = false;
  type_entreprise = 'mon_entreprise'
  prixForm!: FormGroup;
  vehiculeId!: number;
  entrepriseId!: number;
  prixId: number | null = null;
  successMessage!: string;
  isMonEntreprise: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _gveService: CrmService,
    private messageService: MessageService
  ) {
    this.prixForm = this.formBuilder.group({
      prixParKm: [0, Validators.required],
      prixParDuree: [0, Validators.required],
      fraisReservation: [0, Validators.required],
      fraisLivraison: [0, Validators.required],
      fraisParDefaut: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.vehiculeId = +params['vehiculeId'];
      this.entrepriseId = +params['entrepriseId'];
      this.isMonEntreprise = params['entreprise'] === 'mon_entreprise';
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.prixId = +params['id'];
        this.getPrixDetails();
      }
    });
  }

  getPrixDetails(): void {
    if (this.prixId) {
      this._gveService.getPrixDetail(this.prixId).subscribe(
        (prix) => {
          if (prix) {
            this.prixForm.patchValue(prix);
          } else {
            console.log("Les données du prix ne sont pas disponibles.");
          }
        },
        (error) => {
          console.error("Erreur lors de la récupération des données du prix :", error);
        }
      );
    }
  }

  savePrix(): void {
    this.loading = true

    if (this.prixForm.valid) {
      const prixData = {
        vehicule: this.vehiculeId,
        ...this.prixForm.value
      };

      if (this.prixId) {
        this._gveService.updatePrix(this.prixId, prixData).subscribe(

          () => {
            setTimeout(() => {
              this.successMessage = 'Tarification mise à jour avec succès';
              this.showSuccess(this.successMessage);
              this.router.navigate(['/app/parametres/vehicules', this.entrepriseId, this.type_entreprise]);
              this.loading = false
            }, 1500);
          },
          (error) => {
            console.error("Erreur lors de la mise à jour des tarifs :", error);
            this.showError("Erreur lors de la mise à jour des tarifs");
            this.loading = false
          }
        );
      } else {
        this._gveService.createPrix(prixData).subscribe(
          () => {
            setTimeout(() => {
              this.successMessage = 'Tarification ajoutée avec succès';
              this.showSuccess(this.successMessage);
              this.router.navigate(['/app/parametres/vehicules', this.entrepriseId, this.type_entreprise]);
              this.loading = false
            }, 1500);
          },
          (error) => {
            console.error("Erreur lors de l'ajout des tarifs :", error);
            this.showError("Erreur lors de l'ajout des tarifs");
            this.loading = false

          }
        );
      }
    }
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }
}
