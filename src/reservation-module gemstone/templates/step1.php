<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap">

<div class="card mb-4 stepper-content active" id="step-1-content">
  <div class="card-header">
    <h4 class="fw-bold mb-0 custom-uppercase">
      <span class="step-number-circle">1</span> Estimation de Tarif
    </h4>
  </div>
  <div class="card-body">
    <div class="row">
      <div class="col-md-6">
        <div id="mr-map" class="border rounded" style="height: 400px;"></div>
      </div>
      <div class="col-md-6">
        <form id="mr-form-estimation" class="needs-validation" novalidate>
          <div class="form-group mb-3">
            <label for="departAddress" class="form-label custom-uppercase">Adresse de départ</label>
            <input type="text" class="form-control" name="departAddress" id="departAddress"
              placeholder="Saisissez votre adresse de départ" required>
          </div>
          <div class="form-group mb-3">
            <label for="destinationAddress" class="form-label custom-uppercase">Adresse de destination</label>
            <input type="text" class="form-control" name="destinationAddress" id="destinationAddress"
              placeholder="Entrez votre adresse de destination" required>
          </div>
          <div id="date-time-fields" style="display:none;">
            <div class="form-group mb-3">
              <label for="datePriseEnChargeDate" class="form-label custom-uppercase">Date de prise en charge</label>
              <input type="text" class="form-control" name="datePriseEnChargeDate" id="datePriseEnChargeDate"
                placeholder="Sélectionnez la date de prise en charge" required>
            </div>

            <div class="form-group mb-3">
              <label for="datePriseEnChargeTime" class="form-label custom-uppercase">Heure de prise en charge</label>
              <select class="form-control" name="datePriseEnChargeTime" id="datePriseEnChargeTime" required>
                <!-- Les options seront générées via JavaScript -->
              </select>
            </div>

          </div>
        </form>
      </div>
    </div>
    <div class="row mt-4" id="mr-result-buttons" style="display:none;">
      <div class="col-md-6">
        <div id="mr-estimation-result" class="border rounded p-3">
          <div class="d-flex align-items-center">
            <p class="me-4 mb-0">
              <strong>🚗 Distance :</strong> <span id="mr-distance"></span> km
            </p>
            <p class="mb-0">
              <strong>⏱️ Durée :</strong> <span id="mr-duree"></span>
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-6 d-flex justify-content-end align-items-center">
        <button id="mr-annuler" class="btn-custom-secondary me-3">Annuler</button>
        <button class="btn-suivant btn-custom-primary">Suivant</button>
      </div>
    </div>
  </div>
</div>




<!-- Inclure uniquement les scripts nécessaires pour le datepicker -->
<link rel="stylesheet" href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css">
<script src="https://code.jquery.com/ui/1.13.2/jquery-ui.js"></script>
