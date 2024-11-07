<div class="card mb-4 stepper-content col-12 col-md-10 mx-auto" id="step-5-content" style="display: none;">
  <div class="card-header">
    <h4 class="fw-bold mb-0 custom-uppercase">
      <span class="step-number-circle">5</span> Nouvelle Réservation :
      <span class="ms-2" id="numero_reservation"></span>
    </h4>
  </div>

  <div class="card-body">
    <div id="map-container-step5" class="map-container mb-4"></div>

    <!-- Adjusted Summary Info Section -->
    <div class="summary-info mb-4">
    </div>

    <div class="additional-details-section">
      <h5 class="mb-2">DÉTAILS SUPPLÉMENTAIRES</h5>
      <div id="additional-details" class="mb-3"></div>
      <button id="toggle-details-button" class="btn-custom-secondary btn-sm d-flex align-items-center"
        aria-expanded="false" aria-controls="details-content">
        Voir plus <i class="bi bi-chevron-down ms-1"></i>
      </button>
      <div id="details-content" class="details-content"></div>
    </div>

    <div class="d-flex justify-content-between mt-4 flex-wrap">
      <button class="btn-custom-secondary mb-2" id="btn-retour-step5">Retour</button>
      <button class="btn-custom-primary mb-2" id="btn-valider-reservation">Valider la Réservation</button>
    </div>
  </div>
</div>
