<div class="card mb-4 stepper-content" id="step-3-content" style="display: none;">
  <div class="card-header">
    <h4 class="fw-bold mb-0 custom-uppercase">
      <span class="step-number-circle">3</span> Informations Supplémentaires
    </h4>
  </div>
  <div class="card-body">
    <form id="mr-supplement-form" class="needs-validation" novalidate>
      <!-- Première ligne : Nombre de passagers, Nombre de bagages, Type de bagages -->
      <div class="row mb-3">
        <div class="col-md-4">
          <label for="nombrePassager" class="form-label custom-uppercase">
            Nombre De Passagers
            <span style="color: #5E17EB;">*</span>
          </label>
          <select id="nombrePassager" class="form-control"></select>
        </div>
        <div class="col-md-4">
          <label for="capaciteChargement" class="form-label custom-uppercase">
            Nombre de Bagages
            <span style="color: #5E17EB;">*</span>
          </label>
          <select id="capaciteChargement" class="form-control"></select>
        </div>
        <div class="col-md-4">
          <label for="typeBagages" class="form-label custom-uppercase">Type de Bagages</label>
          <input type="text" id="typeBagages" class="form-control" disabled>
        </div>
      </div>

      <!-- Deuxième ligne : Méthode de Paiement, Numéro de Vol/Train, Numéro de Dossier -->
      <div class="row mb-3">
        <div class="col-md-4">
          <label for="modePaiement" class="form-label custom-uppercase">
            Méthode de Paiement
            <span style="color: #5E17EB;">*</span>
          </label>
          <select id="modePaiement" class="form-control"></select>
        </div>
        <div class="col-md-4">
          <label for="compagnieAerienne" class="form-label custom-uppercase">Numéro de Vol/Train</label>
          <input type="text" id="compagnieAerienne" class="form-control" placeholder="Numéro de vol/train (facultatif)">
        </div>
        <div class="col-md-4">
          <label for="numero_dossier" class="form-label custom-uppercase">Numéro de Dossier</label>
          <input type="text" id="numero_dossier" class="form-control" placeholder="Référence dossier (facultatif)">
        </div>
      </div>

      <!-- Notes -->
      <div class="form-group mb-3">
        <label for="note" class="form-label custom-uppercase">Notes</label>
        <textarea id="note" class="form-control" rows="3"
          placeholder="Ajoutez des informations complémentaires (facultatif)"></textarea>
      </div>

      <!-- Bouton Ajouter des Passagers -->
      <div class="form-group mb-3">
        <button type="button" class="btn-custom-add-passenger" id="add-passenger-btn">Ajouter des Passagers</button>
      </div>

      <!-- Liste des passagers -->
      <div id="passenger-list"></div>

      <!-- Boutons Retour et Suivant -->
      <div class="d-flex justify-content-between mt-4">
        <button class="btn-custom-secondary" id="btn-retour-step3">Retour</button>
        <button class="btn-custom-primary" id="btn-suivant-step3">Suivant</button>
      </div>
    </form>
  </div>
</div>
