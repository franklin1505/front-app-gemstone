<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat&display=swap">
<!-- Font Awesome CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" />

<div id="mr-stepper" class="container py-4">
  <h2 class="text-center mb-4 custom-uppercase">Module de Réservation</h2>

  <!-- Étape 1 : Estimation de Tarif -->
  <?php include 'step1.php'; ?>

  <!-- Étape 2 : Choix du Véhicule -->
  <?php include 'step2.php'; ?>

  <!-- Étape 3 : Informations Supplémentaires -->
  <?php include 'step3.php'; ?>

  <!-- Étape 4 : Information Du Client -->
  <?php include 'step4.php'; ?>

  <!-- Étape 5 : Recapitulatif -->
  <?php include 'step5.php'; ?>

  <!-- Étape 6 : Fin du module -->
  <?php include 'step6.php'; ?>


  <div id="mr-loader" class="mr-loader-overlay" style="display:none;">
    <div class="mr-loader-spinner">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</div>
