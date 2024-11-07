<div class="card mb-4 stepper-content" id="step-4-content" style="display: none;">
  <div class="card-header">
    <h4 class="fw-bold mb-0 custom-uppercase">
      <span class="step-number-circle">4</span> Information du Client
    </h4>
  </div>

  <div class="card-body">
    <!-- Choix du type de client -->
    <div class="mb-4">
      <button type="button" class="btn-lg btn-custom-toggle w-100" id="btn-toggle-client-type">
        Pas encore de compte ? Créez un nouveau compte
      </button>
    </div>

    <!-- Section pour un ancien client -->
    <div id="ancien-client-fields" style="display: none;">
      <!-- Instructions pour les anciens clients -->
      <em class="d-block mb-4 description-text">
        Veuillez renseigner vos identifiants pour vous authentifier sur votre compte client.
      </em>
      <form id="ancien-client-form">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="email_ou_telephone" class="form-label">Identifiant</label>
            <input type="text" id="email_ou_telephone" class="form-control" placeholder="Votre adresse email" required>
          </div>
          <div class="col-md-6 mb-3 position-relative">
            <label for="passCode" class="form-label">Mot de Passe</label>
            <input type="password" id="passCode" class="form-control" placeholder="Votre mot de passe" required>
            <!-- <button type="button" id="togglePassword" class="btn-toggle-password">
              <i class="fas fa-eye"></i>
            </button> -->
          </div>

        </div>
      </form>
    </div>

    <!-- Section pour un nouveau client -->
    <div id="nouveau-client-fields" style="display: none;">
      <!-- Instructions pour les nouveaux clients -->
      <em class="d-block mb-4 description-text">
        Entrez vos informations personnelles pour créer un nouveau compte client sécurisé.
      </em>
      <form id="nouveau-client-form">
        <div class="mb-3">
          <label for="type_client" class="form-label">Type de client</label>
          <select id="type_client" class="form-select" required>
            <option value="" disabled selected>Sélectionner un type de client</option>
            <option value="client_simple">Client Particulier</option>
            <option value="client_liee_agence">Client Lié à une Agence</option>
            <option value="client_liee_societe">Client Lié à une Société</option>
            <option value="client_societe">Client Société</option>
            <option value="client_agence">Client Agence</option>
          </select>
        </div>

        <!-- Champs pour un client simple -->
        <div id="client-simple-fields" style="display: none;">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="simple_first_name" class="form-label">Prénom</label>
              <input type="text" id="simple_first_name" class="form-control" placeholder="Entrez votre prénom" required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="simple_last_name" class="form-label">Nom</label>
              <input type="text" id="simple_last_name" class="form-control" placeholder="Entrez votre nom de famille"
                required>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="simple_email" class="form-label">Email</label>
              <input type="email" id="simple_email" class="form-control" placeholder="Votre adresse email" required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="simple_telephone" class="form-label">Téléphone</label>
              <input type="text" id="simple_telephone" class="form-control" placeholder="Votre numéro de téléphone"
                required>
            </div>
          </div>
          <div class="mb-3">
            <label for="simple_adresse" class="form-label">Adresse</label>
            <input type="text" id="simple_adresse" class="form-control" placeholder="Votre adresse complète">
          </div>
        </div>

        <!-- Champs pour un client lié à une agence -->
        <div id="client-liee-agence-fields" style="display: none;">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="agency_first_name" class="form-label">Prénom</label>
              <input type="text" id="agency_first_name" class="form-control" placeholder="Entrez votre prénom" required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="agency_last_name" class="form-label">Nom</label>
              <input type="text" id="agency_last_name" class="form-control" placeholder="Entrez votre nom de famille"
                required>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="agency_email" class="form-label">Email</label>
              <input type="email" id="agency_email" class="form-control" placeholder="Votre adresse email" required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="agency_telephone" class="form-label">Téléphone</label>
              <input type="text" id="agency_telephone" class="form-control" placeholder="Votre numéro de téléphone"
                required>
            </div>
          </div>
          <div class="mb-3">
            <label for="agency_adresse" class="form-label">Adresse</label>
            <input type="text" id="agency_adresse" class="form-control" placeholder="Votre adresse complète">
          </div>
          <div class="mb-3">
            <label for="cle_agence" class="form-label">Clé pour lier à une agence</label>
            <input type="text" id="cle_agence" class="form-control" placeholder="Clé d'identification de l'agence"
              required>
          </div>
        </div>

        <!-- Champs pour un client lié à une société -->
        <div id="client-liee-societe-fields" style="display: none;">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="company_first_name" class="form-label">Prénom</label>
              <input type="text" id="company_first_name" class="form-control" placeholder="Entrez votre prénom"
                required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="company_last_name" class="form-label">Nom</label>
              <input type="text" id="company_last_name" class="form-control" placeholder="Entrez votre nom de famille"
                required>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="company_email" class="form-label">Email</label>
              <input type="email" id="company_email" class="form-control" placeholder="Votre adresse email" required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="company_telephone" class="form-label">Téléphone</label>
              <input type="text" id="company_telephone" class="form-control" placeholder="Votre numéro de téléphone"
                required>
            </div>
          </div>
          <div class="mb-3">
            <label for="company_adresse" class="form-label">Adresse</label>
            <input type="text" id="company_adresse" class="form-control" placeholder="Votre adresse complète">
          </div>
          <div class="mb-3">
            <label for="cle_societe" class="form-label">Clé pour lier à une société</label>
            <input type="text" id="cle_societe" class="form-control" placeholder="Clé d'identification de la société"
              required>
          </div>
        </div>

        <!-- Champs pour un client société -->
        <div id="client-societe-fields" style="display: none;">
          <div class="mb-3">
            <label for="nom_societe" class="form-label">Nom de la société</label>
            <input type="text" id="nom_societe" class="form-control" placeholder="Entrez le nom de la société" required>
          </div>
          <div class="mb-3">
            <label for="adresse_societe" class="form-label">Adresse de la société</label>
            <input type="text" id="adresse_societe" class="form-control" placeholder="Adresse complète de la société"
              required>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="email_societe" class="form-label">Email de la société</label>
              <input type="email" id="email_societe" class="form-control" placeholder="Adresse email de la société"
                required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="telephone_societe" class="form-label">Téléphone de la société</label>
              <input type="text" id="telephone_societe" class="form-control"
                placeholder="Numéro de téléphone de la société" required>
            </div>
          </div>
        </div>

        <!-- Champs pour un client agence -->
        <div id="client-agence-fields" style="display: none;">
          <div class="mb-3">
            <label for="nom_agence" class="form-label">Nom de l'agence</label>
            <input type="text" id="nom_agence" class="form-control" placeholder="Entrez le nom de l'agence" required>
          </div>
          <div class="mb-3">
            <label for="adresse_agence" class="form-label">Adresse de l'agence</label>
            <input type="text" id="adresse_agence" class="form-control" placeholder="Adresse complète de l'agence"
              required>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="email_agence" class="form-label">Email de l'agence</label>
              <input type="email" id="email_agence" class="form-control" placeholder="Adresse email de l'agence"
                required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="telephone_agence" class="form-label">Téléphone de l'agence</label>
              <input type="text" id="telephone_agence" class="form-control"
                placeholder="Numéro de téléphone de l'agence" required>
            </div>
          </div>
        </div>

      </form>
    </div>

    <!-- Boutons de navigation -->
    <div class="d-flex justify-content-between mt-4">
      <button class="btn-custom-secondary" id="btn-retour-step4">Retour</button>
      <button class="btn-custom-primary" id="btn-suivant-step4">Suivant</button>
    </div>
  </div>
</div>
