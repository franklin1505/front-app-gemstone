(function ($) {
  const ReservationModule = {
    currentStep: 1,
    totalSteps: 6,
    transportEstimates: [],
    vehiculesStockes: [],
    selectedVehicule: null,
    supplements: [],
    reservation_tab: {},
    globalPaymentMethods: [],
    passengers: [],
    clients: [],
    clientDetails: null,
    clientType: "ancien",
    commissionRate: 10,
    compensation: 0,
    mapInstances: {},

    init() {
      this.updateStep(this.currentStep);
      this.bindEvents();
      this.loadPaymentMethods();
      this.disablePastDates();
      this.initGoogleComponents();
      this.setupToggleDetails();

      this.initDatePicker();
      this.initTimeSelect();
    },

    initDatePicker() {
      $("#datePriseEnChargeDate").datepicker({
        dateFormat: "dd/mm/yy",
        minDate: 0,
        showAnim: "fadeIn",
      });
    },

    initTimeSelect() {
      const select = $("#datePriseEnChargeTime");
      const startTime = 0; // 0 heures
      const endTime = 23; // 23 heures

      select.append(
        '<option value="" disabled selected>Choisissez l\'heure de prise en charge</option>'
      );

      for (let hour = startTime; hour <= endTime; hour++) {
        const hourLabel = ("0" + hour).slice(-2) + "h";
        const optgroup = $(`<optgroup label="${hourLabel}"></optgroup>`);

        for (let minutes = 0; minutes < 60; minutes++) {
          const time = ("0" + hour).slice(-2) + ":" + ("0" + minutes).slice(-2);
          optgroup.append(`<option value="${time}">${time}</option>`);
        }

        select.append(optgroup);
      }
    },

    formatDateTime(dateStr, timeStr) {
      const dateParts = dateStr.split("/");
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Months start at 0 in JS
      let year = parseInt(dateParts[2], 10);
      if (year < 100) {
        year += 2000; // Add 2000 for two-digit years
      }

      const timeParts = timeStr.split(":");
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      const date = new Date(year, month, day, hours, minutes, 0);
      const yearStr = date.getFullYear();
      const monthStr = ("0" + (date.getMonth() + 1)).slice(-2);
      const dayStr = ("0" + date.getDate()).slice(-2);
      const hourStr = ("0" + date.getHours()).slice(-2);
      const minuteStr = ("0" + date.getMinutes()).slice(-2);
      const secondStr = ("0" + date.getSeconds()).slice(-2);

      return `${yearStr}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:${secondStr}`;
    },

    displayReservationNumber() {
      const numeroReservation = this.reservation_tab.numeroReservation || "";
      $("#numero_reservation").text(numeroReservation);
    },

    displaySummaryInfo() {
      this.displayReservationNumber();
      const { nombrePassagers, nombreBagage, distance, duree } = this.reservation_tab;

      let summaryHtml = `
        <div class="row d-flex flex-row justify-content-between">
      `;

      if (nombrePassagers) {
        summaryHtml += `
          <div class="col summary-item">
            <i class="bi bi-people-fill custom-color"></i>
            <span>${nombrePassagers} Passager${nombrePassagers > 1 ? "s" : ""}</span>
          </div>
        `;
      }

      if (nombreBagage) {
        summaryHtml += `
          <div class="col summary-item">
            <i class="bi bi-bag custom-color"></i>
            <span>${nombreBagage}</span>
          </div>
        `;
      }

      if (distance) {
        summaryHtml += `
          <div class="col summary-item">
            <i class="bi bi-signpost-split-fill custom-color"></i>
            <span>${distance} Km</span>
          </div>
        `;
      }

      if (duree) {
        summaryHtml += `
          <div class="col summary-item">
            <i class="bi bi-clock-fill custom-color"></i>
            <span>${duree}</span>
          </div>
        `;
      }

      summaryHtml += "</div>";

      $(".summary-info").html(summaryHtml);
    },

    displayAdditionalDetails() {
      const {
        datePriseEnCharge,
        lieuxPriseEnCharge,
        lieuxDestination,
        detailVehicule,
        clientDetails,
        modePaiement,
        compagnieAerienne,
        numeroDossier,
        typeVehicule,
        coutTransport = 0,
        totalAttributCost = 0,
        coutTotalReservation = 0,
      } = this.reservation_tab;

      const formatDateTimeDisplay = (isoString) => {
        const date = new Date(isoString);
        const optionsDate = {
          day: "2-digit",
          month: "short",
          year: "numeric",
        };
        const optionsTime = {
          hour: "2-digit",
          minute: "2-digit",
        };
        let formattedDate = date.toLocaleDateString("fr-FR", optionsDate);
        let formattedTime = date.toLocaleTimeString("fr-FR", optionsTime);
        return `${formattedDate} à ${formattedTime}`;
      };

      let detailsHtml = '<div class="details-wrapper row">';

      if (datePriseEnCharge) {
        detailsHtml += `
          <div class="col-md-12 col-12 detail-row">
            <strong>Date et Heure:</strong> <span>${formatDateTimeDisplay(datePriseEnCharge)}</span>
          </div>`;
      }
      if (lieuxPriseEnCharge) {
        detailsHtml += `
          <div class="col-md-12 col-12 detail-row">
            <strong>Départ:</strong> <span>${lieuxPriseEnCharge}</span>
          </div>`;
      }
      if (lieuxDestination) {
        detailsHtml += `
          <div class="col-md-12 col-12 detail-row">
            <strong>Destination:</strong> <span>${lieuxDestination}</span>
          </div>`;
      }
      if (detailVehicule && typeVehicule) {
        detailsHtml += `
          <div class="col-md-12 col-12 detail-row">
            <strong>Véhicule:</strong> <span>${detailVehicule.marque} ${detailVehicule.modele} (${typeVehicule})</span>
          </div>`;
      }
      if (clientDetails) {
        detailsHtml += `
          <div class="col-md-12 col-12 detail-row">
            <strong>Client:</strong> <span>${clientDetails.first_name} ${clientDetails.last_name}</span>
          </div>`;
      }
      if (modePaiement) {
        detailsHtml += `
          <div class="col-md-12 col-12 detail-row">
            <strong>Mode de Paiement:</strong> <span>${this.formatPaymentMethodName(modePaiement)}</span>
          </div>`;
      }
      if (compagnieAerienne) {
        detailsHtml += `
          <div class="col-md-12 col-12 detail-row">
            <strong>Nº de Vol/Train:</strong> <span>${compagnieAerienne}</span>
          </div>`;
      }
      if (numeroDossier) {
        detailsHtml += `
          <div class="col-md-12 col-12 detail-row">
            <strong>Nº de Dossier:</strong> <span>${numeroDossier}</span>
          </div>`;
      }
      if (coutTransport) {
        detailsHtml += `
          <div class="col-md-12 col-12 detail-row">
            <strong>Coût de Trajet:</strong> <span>${coutTransport.toFixed(2)} €</span>
          </div>`;
      }
      if (totalAttributCost) {
        detailsHtml += `
          <div class="col-md-12 col-12 detail-row">
            <strong>Coût des Suppléments:</strong> <span>${totalAttributCost.toFixed(2)} €</span>
          </div>`;
      }
      if (coutTotalReservation) {
        detailsHtml += `
          <div class="col-md-12 col-12 detail-row">
            <strong>Tarif de la Course:</strong> <span>${coutTotalReservation.toFixed(2)} €</span>
          </div>`;
      }

      detailsHtml += "</div>";
      $("#additional-details").html(detailsHtml);
    },

    displayHiddenDetails() {
      const { passengers = [], supplements = [], note } = this.reservation_tab;

      let hiddenDetailsHtml = '<div class="details-column">';

      if (passengers.length > 0) {
        const passengersHtml = passengers
          .map(
            (p) => `<li class="d-block"><span class="mr-1 custon-font-weight">Nom : </span>${this.escapeHtml(p.name)} - <span class="mr-1 custon-font-weight">Numero :</span>  ${this.escapeHtml(p.phone)}</li>`
          )
          .join("");
        hiddenDetailsHtml += `
          <strong>Liste des passagers ajoutés :</strong>
          <div class="detail-item">
            <ul class="list-unstyled">${passengersHtml}</ul>
          </div>`;
      }

      if (supplements.length > 0) {
        const supplementsHtml = supplements
          .map(
            (s) => `<li class="d-block">${s.quantite} ${this.escapeHtml(s.nom_attribut)} (${s.prix_unitaire_attribut.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}€/ unité)</li>`
          )
          .join("");
        hiddenDetailsHtml += `
          <strong>Suppléments :</strong>
          <div class="detail-item">
            <ul class="list-unstyled">${supplementsHtml}</ul>
          </div>`;
      }

      if (note && note.trim() !== "") {
        hiddenDetailsHtml += `
          <div class="detail-item">
            <p><span class="mb-0 custon-font-weight">Note :</span> ${this.escapeHtml(note)}</p>
          </div>`;
      }

      hiddenDetailsHtml += "</div>";
      $("#details-content").html(hiddenDetailsHtml);
    },

    toggleDetails() {
      const detailsContent = $('#details-content');
      const toggleButton = $('#toggle-details-button');

      if (detailsContent.is(':hidden')) {
        detailsContent.slideDown(200);
        toggleButton.html('Voir moins <i class="bi bi-chevron-up ms-1"></i>');
        toggleButton.attr('aria-expanded', 'true');
      } else {
        detailsContent.slideUp(200);
        toggleButton.html('Voir plus <i class="bi bi-chevron-down ms-1"></i>');
        toggleButton.attr('aria-expanded', 'false');
      }
    },

    setupToggleDetails() {
      $("#toggle-details-button").on("click", () => this.toggleDetails());
    },

    escapeHtml(text) {
      return $("<div>").text(text).html();
    },

    bindEvents() {
      // Gestionnaire d'événements générique pour les boutons "Suivant"
      $(".btn-suivant").not("#btn-suivant-step4").on("click", () => this.nextStep());

      // Gestionnaire d'événements générique pour les boutons "Retour"
      $(".btn-retour").on("click", () => this.previousStep());

      // Gestion des changements de date et d'heure pour l'estimation
      $("#datePriseEnChargeDate, #datePriseEnChargeTime").on("change", () =>
        this.handleEstimation()
      );

      // Gestionnaire spécifique pour le bouton "Retour" de l'étape 3
      $("#btn-retour-step3").on("click", (event) => {
        event.preventDefault();
        this.previousStep();
      });

      // Gestionnaire spécifique pour le bouton "Retour" de l'étape 4
      $("#btn-retour-step4").on("click", (event) => {
        event.preventDefault();
        this.previousStep();
      });

      // Gestionnaire spécifique pour le bouton "Suivant" de l'étape 3
      $("#btn-suivant-step3").on("click", (event) => {
        event.preventDefault();
        if (this.validateStep3Fields()) {
          this.nextStep();
        }
      });

      // Gestionnaire spécifique pour le bouton "Retour" de l'étape 5
      $("#btn-retour-step5").on("click", (event) => {
        event.preventDefault();
        this.updateStep(4); // Retour à l'étape 4 sans modifier currentStep
        this.currentStep = 4; // Assurez-vous que currentStep est correctement mis à jour
      });

      // Gestionnaire spécifique pour le bouton "Suivant" de l'étape 4
      $("#btn-suivant-step4").on("click", (event) => {
        event.preventDefault();
        if (this.clientType === "ancien") {
          this.handleAncienClientAuthentication();
        } else {
          this.handleNouveauClientRegistration();
        }
      });

      // Gestionnaire spécifique pour valider la réservation à l'étape 5
      $("#btn-valider-reservation").on("click", (event) => {
        event.preventDefault();
        const reservationData = this.generateReservationData();
        if (this.validateReservationData(reservationData)) {
          this.createReservation();
        }
      });

      // Gestionnaire pour ajouter des passagers
      $("#add-passenger-btn").on("click", () => {
        if (this.validateLastPassenger()) {
          this.addPassenger();
        } else {
          alert(
            "Veuillez remplir les informations du passager précédent avant d'ajouter un nouveau passager."
          );
        }
      });

      // Gestionnaire pour afficher/masquer le mot de passe
      $("#togglePassword").on("click", () => this.togglePasswordVisibility());

      // Gestionnaire pour changer le type de client
      $(document).on("change", "#type_client", (event) =>
        this.onTypeClientChange(event)
      );

      // Gestionnaire pour basculer le type de client (ancien/nouveau)
      $("#btn-toggle-client-type").on("click", () => this.toggleClientType());
    },

    togglePasswordVisibility() {
      const passwordField = $("#passCode");
      const toggleIcon = $("#togglePassword i");

      if (passwordField.attr("type") === "password") {
        passwordField.attr("type", "text");
        toggleIcon.removeClass("fa-eye").addClass("fa-eye-slash");
      } else {
        passwordField.attr("type", "password");
        toggleIcon.removeClass("fa-eye-slash").addClass("fa-eye");
      }
    },

    onTypeClientChange(event) {
      const selectedClientType = $(event.target).val();
      // Masquer tous les champs
      $(
        "#client-simple-fields, #client-liee-agence-fields, #client-liee-societe-fields, #client-societe-fields, #client-agence-fields"
      ).hide();

      // Afficher la section appropriée
      switch (selectedClientType) {
        case "client_simple":
          $("#client-simple-fields").show();
          break;
        case "client_liee_agence":
          $("#client-liee-agence-fields").show();
          break;
        case "client_liee_societe":
          $("#client-liee-societe-fields").show();
          break;
        case "client_societe":
          $("#client-societe-fields").show();
          break;
        case "client_agence":
          $("#client-agence-fields").show();
          break;
        default:
          console.warn("Type de client non géré :", selectedClientType);
      }
    },

    toggleClientType() {
      if (this.clientType === "ancien") {
        this.clientType = "nouveau";
        $("#btn-toggle-client-type").text(
          "Déjà un compte ? Utilisez vos identifiants"
        );
        $("#ancien-client-fields").hide();
        $("#nouveau-client-fields").show();
      } else {
        this.clientType = "ancien";
        $("#btn-toggle-client-type").text(
          "Pas encore de compte ? Créez un nouveau compte"
        );
        $("#nouveau-client-fields").hide();
        $("#ancien-client-fields").show();
      }
    },

    // Calculer les coûts avec commission
    calculateCommissionAndCompensation() {
      const { coutTotalReservation } = this.reservation_tab;
      const commission = (this.commissionRate / 100) * coutTotalReservation;
      const coutDeVente = (coutTotalReservation - commission).toFixed(2);

      this.reservation_tab = {
        ...this.reservation_tab,
        commission: this.commissionRate,
        compensation: this.compensation,
        coutDeVente: parseFloat(coutDeVente),
      };
    },

    getVehiculeDetails() {
      const vehiculeId = this.reservation_tab.vehicule;
      const vehicule = this.vehiculesStockes.find((v) => v.id === vehiculeId);

      if (vehicule) {
        this.reservation_tab.detailVehicule = {
          ...vehicule,
        };
      } else {
        console.warn("Aucun véhicule trouvé avec cet ID:", vehiculeId);
      }
    },

    generateReservationData() {
      const formattedData = {
        numero_reservation: this.reservation_tab.numeroReservation || "",
        utilisateur: this.reservation_tab.clientDetails?.id || "",
        datePriseEnCharge: this.reservation_tab.datePriseEnCharge || "",
        coutTransport: this.reservation_tab.coutTransport || 0,
        coutMajorer: this.reservation_tab.coutMajorer || 0,
        lieuxPriseEnCharge: this.reservation_tab.lieuxPriseEnCharge || "",
        lieuxDestination: this.reservation_tab.lieuxDestination || "",
        distance: this.reservation_tab.distance || 0,
        duree: this.reservation_tab.duree || "",
        typeReservation: this.reservation_tab.typeVehicule || "standard",
        vehicule: this.reservation_tab.vehicule || null,
        distanceWaypoint: this.reservation_tab.distanceWaypoint || 0,
        destinationInputs: [],
        coutTotalReservation: this.reservation_tab.coutTotalReservation || 0,
        totalAttributCost: this.reservation_tab.totalAttributCost || 0,
        attribut: this.reservation_tab.supplements || [],
        notes: this.generateNotes(),
        nombreBagage: this.reservation_tab.nombreBagage || "",
        nombrePassager: this.reservation_tab.nombrePassager || 1,
        compagnieAerienne: this.reservation_tab.compagnieAerienne || "",
        modePaiement: this.reservation_tab.modePaiement || "payement_abord",
        statutReservation:
          this.reservation_tab.statutReservation || "en_attente",
        numero_dossier: this.reservation_tab.numeroDossier || "",
        commission: this.reservation_tab.commission || 10,
        compensation: this.reservation_tab.compensation || 0,
        coutDeVente: this.reservation_tab.coutDeVente || 0,
      };

      // **Ajoutez ce log pour vérifier les données générées**
      console.log("Données de réservation générées :", formattedData);

      return formattedData;
    },

    generateNotes() {
      const notes =
        this.reservation_tab.passengers?.map((p) => ({
          type: "passenger",
          content: `nom: ${p.name}, numero: ${p.phone}`,
        })) || [];

      if (this.reservation_tab.note) {
        notes.push({
          type: "note",
          content: this.reservation_tab.note,
        });
      }

      // **Ajoutez ce log pour vérifier les notes générées**
      console.log("Notes générées :", notes);

      return notes;
    },

    createReservation() {
      const reservationData = this.generateReservationData();

      // **Ajoutez ce log avant l'envoi**
      console.log("Données de réservation envoyées :", reservationData);

      $("#mr-loader").show();

      $.ajax({
        url: mr_vars.ajax_url,
        type: "POST",
        dataType: "json",
        data: {
          action: "mr_create_reservation",
          nonce: mr_vars.nonce,
          ...reservationData,
        },
        success: (response) => {
          $("#mr-loader").hide();

          if (response.success) {
            this.handleSuccess(response.data);
          } else {
            console.error("Erreur lors de la réservation :", response);
            // **Ajoutez ce log pour voir les données d'erreur**
            console.log("Réponse d'erreur :", response);
            alert("Erreur lors de la réservation : " + (response.data.message || "Erreur inconnue"));
          }
        },
        error: (xhr, status, error) => {
          $("#mr-loader").hide();
          console.error("Erreur de communication avec le serveur :", error);
          alert("Erreur de communication avec le serveur : " + error);
        },
      });
    },

    handleSuccess(data) {
      this.updateStep(6);
      this.showConfirmationMessage();
    },

    validateReservationData(data) {
      const requiredFields = [
        "numero_reservation",
        "utilisateur",
        "datePriseEnCharge",
        "coutTransport",
        "lieuxPriseEnCharge",
        "lieuxDestination",
        "distance",
        "duree",
        "typeReservation",
        "vehicule",
        "coutTotalReservation",
        "totalAttributCost",
        "nombrePassager",
        "modePaiement",
        "statutReservation",
      ];

      for (const field of requiredFields) {
        if (
          data[field] === undefined ||
          data[field] === null ||
          data[field] === ""
        ) {
          console.warn(`Champ manquant ou incorrect : ${field}`);
          return false;
        }
      }

      return true;
    },

    generateFormData(typeClient) {
      let formData = {
        action: "mr_register_client",
        type_client: typeClient,
        nonce: mr_vars.nonce,
      };

      switch (typeClient) {
        case "client_simple":
          formData = Object.assign(formData, {
            first_name: $("#simple_first_name").val(),
            last_name: $("#simple_last_name").val(),
            email: $("#simple_email").val(),
            telephone: $("#simple_telephone").val(),
            adresse: $("#simple_adresse").val(),
          });
          break;
        case "client_liee_agence":
          formData = Object.assign(formData, {
            first_name: $("#agency_first_name").val(),
            last_name: $("#agency_last_name").val(),
            email: $("#agency_email").val(),
            telephone: $("#agency_telephone").val(),
            adresse: $("#agency_adresse").val(),
            cle_agence: $("#cle_agence").val(),
          });
          break;
        case "client_liee_societe":
          formData = Object.assign(formData, {
            first_name: $("#company_first_name").val(),
            last_name: $("#company_last_name").val(),
            email: $("#company_email").val(),
            telephone: $("#company_telephone").val(),
            adresse: $("#company_adresse").val(),
            cle_societe: $("#cle_societe").val(),
          });
          break;
        case "client_societe":
          formData = Object.assign(formData, {
            nom_societe: $("#nom_societe").val(),
            adresse_societe: $("#adresse_societe").val(),
            email_societe: $("#email_societe").val(),
            telephone_societe: $("#telephone_societe").val(),
          });
          break;
        case "client_agence":
          formData = Object.assign(formData, {
            nom_agence: $("#nom_agence").val(),
            adresse_agence: $("#adresse_agence").val(),
            email_agence: $("#email_agence").val(),
            telephone_agence: $("#telephone_agence").val(),
          });
          break;
      }

      // **Ajoutez ce log pour vérifier les données du formulaire**
      console.log("FormData pour l'enregistrement du client :", formData);

      return formData;
    },

    generateNumeroReservation() {
      const currentYear = new Date().getFullYear();
      const timestamp = new Date().getTime().toString().slice(-4); // Last 4 digits of timestamp

      const lieuxPriseEnCharge = (this.reservation_tab.lieuxPriseEnCharge || "")
        .substring(0, 2)
        .toUpperCase();
      const lieuxDestination = (this.reservation_tab.lieuxDestination || "")
        .substring(0, 2)
        .toUpperCase();
      const clientId = this.reservation_tab.clientDetails?.id || "00";
      const nombrePassagers = this.reservation_tab.nombrePassagers || 0;
      const typeBagages =
        this.reservation_tab.typeBagages?.charAt(0).toUpperCase() || "X";

      const numeroReservation = `${currentYear}R${clientId}${lieuxPriseEnCharge}${lieuxDestination}${nombrePassagers}${typeBagages}${timestamp}`;
      this.reservation_tab.numeroReservation = numeroReservation;

      return numeroReservation;
    },

    combineBagageFields() {
      const capaciteChargement = this.reservation_tab.capaciteChargement;
      const typeBagages = this.reservation_tab.typeBagages;

      if (capaciteChargement && typeBagages) {
        const nombreBagage = `${capaciteChargement} ${typeBagages}`;
        this.reservation_tab.nombreBagage = nombreBagage;
      }
    },

    prepareReservationDetails() {
      this.generateNumeroReservation();
      this.combineBagageFields();
      this.calculateCommissionAndCompensation();
      this.getVehiculeDetails();

      // Format date and time
      const datePriseEnChargeDate = $("#datePriseEnChargeDate").val();
      const datePriseEnChargeTime = $("#datePriseEnChargeTime").val();
      const formattedDateTime = this.formatDateTime(
        datePriseEnChargeDate,
        datePriseEnChargeTime
      );
      this.reservation_tab.datePriseEnCharge = formattedDateTime;

      this.nextStep();
    },

    handleAncienClientAuthentication() {
      const formData = {
        action: "mr_authenticate_client",
        email_ou_telephone: $("#email_ou_telephone").val(),
        passCode: $("#passCode").val(),
        nonce: mr_vars.nonce,
      };

      $("#mr-loader").show();

      $.post(
        mr_vars.ajax_url,
        formData,
        (response) => {
          $("#mr-loader").hide();
          console.log("Réponse AJAX complète :", response);

          if (response.data.success) {
            console.log("Authentification réussie :", response.data);

            this.recupererInformationsUtilisateur(
              $("#email_ou_telephone").val(),
              (clientFound) => {
                if (clientFound) {
                  this.prepareReservationDetails();
                } else {
                  alert("Aucun client trouvé avec cet email ou numéro de téléphone.");
                }
              }
            );
          } else {
            console.error("Erreur d'authentification :", response.data.message);
            alert("Erreur : " + response.data.message);
          }
        },
        "json"
      ).fail((jqXHR, textStatus, errorThrown) => {
        $("#mr-loader").hide();
        console.error("Erreur de communication :", textStatus, errorThrown);
        alert("Erreur de communication avec le serveur.");
      });
    },

    handleNouveauClientRegistration() {
      const typeClient = $("#type_client").val();
      const formData = this.generateFormData(typeClient);
      let emailClient =
        formData.email || formData.email_societe || formData.email_agence;

      $("#mr-loader").show();

      $.post(
        mr_vars.ajax_url,
        formData,
        (response) => {
          $("#mr-loader").hide();
          if (response.success) {
            this.getClientsByEmail(emailClient, (clientFound) => {
              if (clientFound) {
                this.prepareReservationDetails();
              } else {
                alert("Client créé, mais impossible de le retrouver.");
              }
            });
          } else {
            alert(response.data.message);
            console.error("Erreur API:", response);
          }
        },
        "json"
      ).fail(() => {
        $("#mr-loader").hide();
        alert("Erreur de communication avec le serveur.");
      });
    },

    recupererInformationsUtilisateur(emailOrPhone, callback) {
      $.post(
        mr_vars.ajax_url,
        {
          action: "mr_fetch_clients",
          nonce: mr_vars.nonce,
        },
        (response) => {
          if (
            response.success &&
            response.data.clients &&
            Array.isArray(response.data.clients)
          ) {
            this.clients = response.data.clients;
            const client = this.clients.find(
              (c) =>
                c.email?.trim().toLowerCase() ===
                emailOrPhone.trim().toLowerCase() ||
                c.telephone?.replace(/\s/g, "") ===
                emailOrPhone.replace(/\s/g, "")
            );

            if (client) {
              this.clientDetails = client;
              this.reservation_tab.clientDetails = client;
              callback(true);
            } else {
              alert(
                "Aucun client trouvé avec cet email ou numéro de téléphone."
              );
              callback(false);
            }
          } else {
            alert("Erreur de récupération des clients");
            callback(false);
          }
        }
      ).fail(() => {
        alert("Erreur lors de la connexion au serveur.");
        callback(false);
      });
    },

    getClientsByEmail(email, callback) {
      $.post(
        mr_vars.ajax_url,
        {
          action: "mr_fetch_clients",
          nonce: mr_vars.nonce,
        },
        (response) => {
          if (
            response.success &&
            response.data.clients &&
            Array.isArray(response.data.clients)
          ) {
            const clients = response.data.clients;
            const client = clients.find(
              (c) =>
                c.email?.trim().toLowerCase() === email.trim().toLowerCase()
            );

            if (client) {
              this.clientDetails = client;
              this.reservation_tab.clientDetails = client;
              callback(true);
            } else {
              callback(false);
            }
          } else {
            callback(false);
          }
        },
        "json"
      ).fail(() => {
        alert("Erreur lors de la connexion au serveur.");
        callback(false);
      });
    },

    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        if (this.currentStep > this.totalSteps) this.currentStep = this.totalSteps;

        if (this.currentStep === 1) {
          this.initMapForStep(1, "mr-map");
        }

        if (this.currentStep === 2) {
          this.loadVehicules();
          this.loadSupplements();
        }

        if (this.currentStep === 3) {
          this.preFillDataToReservationTab();
          this.displayPaymentMethods();
          this.updateStep3Fields();
          this.calculateTotalCost();
        }

        if (this.currentStep === 4) {
          $("#ancien-client-fields").show();
          $("#nouveau-client-fields").hide();
          $("#btn-ancien-client").addClass("active");
        }

        if (this.currentStep === 5) {
          this.displaySummaryInfo();
          this.displayAdditionalDetails();
          this.displayHiddenDetails();

          // Initialiser la carte après que l'étape soit visible
          this.initMapForStep(5, "map-container-step5");

          const { lieuxPriseEnCharge, lieuxDestination } = this.reservation_tab;
          if (lieuxPriseEnCharge && lieuxDestination) {
            this.afficherTrajetForStep(5, lieuxPriseEnCharge, lieuxDestination);
          }
        }

        this.updateStep(this.currentStep);
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        if (this.currentStep < 1) this.currentStep = 1;
        this.updateStep(this.currentStep);
      }
    },

    updateStep(step) {
      $(".stepper-content").hide();
      $(`#step-${step}-content`).show();
    },

    preFillDataToReservationTab() {
      if (this.selectedVehicule) {
        const capaciteChargementParts =
          this.selectedVehicule.capacite_chargement.split(" ");
        if (capaciteChargementParts.length === 2) {
          this.reservation_tab.capaciteChargement = parseInt(
            capaciteChargementParts[0],
            10
          );
          this.reservation_tab.typeBagages = this.formatTypeBagages(
            capaciteChargementParts[1]
          );
        }
        this.reservation_tab.capacitePassagers = parseInt(
          this.selectedVehicule.capacite_passagers,
          10
        );
      }
    },

    formatTypeBagages(type) {
      const types = {
        Cabine: "Bagage cabine",
        M: "Valise moyenne",
        L: "Valise large",
        XL: "Valise extra-large",
      };
      return types[type] || type;
    },

    addPassenger() {
      const passengerIndex = this.passengers.length + 1;
      $("#passenger-list").append(`
        <div class="passenger-entry" data-index="${passengerIndex}">
          <div class="row">
            <div class="col-md-5 mb-2">
              <input type="text" class="form-control passenger-name" placeholder="Nom du passager" required>
            </div>
            <div class="col-md-5 mb-2">
              <input type="text" class="form-control passenger-phone" placeholder="Téléphone du passager (ex: 0601020304)" required>
            </div>
            <div class="col-md-2 mb-2 d-flex align-items-center">
              <button type="button" class="remove-passenger-btn btn-sm" data-index="${passengerIndex}">Supprimer</button>
            </div>
          </div>
        </div>
      `);
      this.passengers.push({
        name: "",
        phone: "",
      });

      const newPassengerEntry = $("#passenger-list .passenger-entry").last();

      // Mettre à jour le tableau des passagers lorsque les entrées changent
      newPassengerEntry.find(".passenger-name").on("input", (event) => {
        this.passengers[passengerIndex - 1].name = $(event.target).val();
      });

      newPassengerEntry.find(".passenger-phone").on("input", (event) => {
        this.passengers[passengerIndex - 1].phone = $(event.target).val();
      });

      // Lier l'événement de suppression
      $(`.remove-passenger-btn[data-index="${passengerIndex}"]`).on(
        "click",
        () => this.removePassenger(passengerIndex)
      );
    },

    validateLastPassenger() {
      const lastPassengerEntry = $("#passenger-list .passenger-entry").last();
      if (lastPassengerEntry.length === 0) {
        // Aucun passager pour l'instant, donc rien à valider
        return true;
      }
      const name = lastPassengerEntry.find(".passenger-name").val().trim();
      const phone = lastPassengerEntry.find(".passenger-phone").val().trim();
      return name !== "" && phone !== "";
    },

    removePassenger(index) {
      this.passengers.splice(index - 1, 1);
      $(`.passenger-entry[data-index="${index}"]`).remove();
    },

    handleEstimation() {
      const departAddress = $("#departAddress").val();
      const destinationAddress = $("#destinationAddress").val();
      const datePriseEnChargeDate = $("#datePriseEnChargeDate").val();
      const datePriseEnChargeTime = $("#datePriseEnChargeTime").val();

      if (
        departAddress &&
        destinationAddress &&
        datePriseEnChargeDate &&
        datePriseEnChargeTime
      ) {
        $("#mr-loader").show();
        $("#mr-result-buttons").hide();
        setTimeout(() => {
          this.calculerEstimation(
            departAddress,
            destinationAddress,
            datePriseEnChargeDate,
            datePriseEnChargeTime
          );
        }, 2000);
      }
    },

    calculerEstimation(
      departAddress,
      destinationAddress,
      datePriseEnChargeDate,
      datePriseEnChargeTime
    ) {
      // Formater la date et l'heure
      const formattedDateTime = this.formatDateTime(
        datePriseEnChargeDate,
        datePriseEnChargeTime
      );

      const formData = {
        departAddress,
        destinationAddress,
        datePriseEnCharge: formattedDateTime,
      };

      $.ajax({
        url: mr_vars.ajax_url,
        type: "POST",
        dataType: "json",
        data: {
          action: "mr_calculer_estimation",
          nonce: mr_vars.nonce,
          formData,
        },
        success: (response) => {
          $("#mr-loader").hide();
          if (response.success) {
            $("#mr-distance").text(response.data.distance);
            $("#mr-duree").text(response.data.duree);
            this.transportEstimates = response.data.transport_estimates || [];
            $("#mr-estimation-result").show();
            $("#mr-result-buttons").show();
            this.reservation_tab = {
              lieuxPriseEnCharge: departAddress,
              lieuxDestination: destinationAddress,
              datePriseEnCharge: formattedDateTime,
              distance: response.data.distance,
              duree: response.data.duree,
            };
            this.loadVehicules();
          } else {
            alert(response.data.message);
          }
        },
        error: () => {
          $("#mr-loader").hide();
          alert("Une erreur est survenue lors du calcul de l'estimation.");
        },
      });
    },

    filterVehiculesByEstimates(vehicules) {
      if (
        Array.isArray(this.transportEstimates) &&
        this.transportEstimates.length > 0
      ) {
        const vehiculeIds = this.transportEstimates.map(
          (estimate) => estimate.vehicule
        );
        return vehicules.filter((vehicule) =>
          vehiculeIds.includes(vehicule.id)
        );
      }
      return vehicules;
    },

    loadVehicules() {
      $.ajax({
        url: mr_vars.ajax_url,
        type: "POST",
        dataType: "json",
        data: {
          action: "mr_fetch_vehicules",
          nonce: mr_vars.nonce,
        },
        success: (response) => {
          if (response.success && Array.isArray(response.data.vehicules)) {
            this.vehiculesStockes = this.filterVehiculesByEstimates(
              response.data.vehicules
            );
            this.displayVehicules(this.vehiculesStockes);
          } else {
            alert("Erreur lors du chargement des véhicules.");
          }
        },
        error: () => {
          alert("Une erreur est survenue lors du chargement des véhicules.");
        },
      });
    },

    loadSupplements() {
      $.ajax({
        url: mr_vars.ajax_url,
        type: "POST",
        dataType: "json",
        data: {
          action: "mr_fetch_attributs",
          nonce: mr_vars.nonce,
        },
        success: (response) => {
          if (response.success && Array.isArray(response.data.attributs)) {
            this.supplements = response.data.attributs.map((supplement) => ({
              ...supplement,
              quantite: 0,
            }));
            this.displaySupplements();
          } else {
            alert("Erreur lors du chargement des suppléments.");
          }
        },
        error: () => {
          alert("Une erreur est survenue lors du chargement des suppléments.");
        },
      });
    },

    loadPaymentMethods() {
      $.ajax({
        url: mr_vars.ajax_url,
        type: "POST",
        dataType: "json",
        data: {
          action: "mr_fetch_payment_methods",
          nonce: mr_vars.nonce,
        },
        success: (response) => {
          if (
            response.success &&
            Array.isArray(response.data.payment_methods)
          ) {
            this.globalPaymentMethods = response.data.payment_methods
              .filter((methode) => methode.is_active)
              .map((methode) => ({
                nom: methode.nom,
                label: this.formatPaymentMethodName(methode.nom),
              }));
          } else {
            alert(
              response.data.message ||
              "Erreur lors du chargement des méthodes de paiement."
            );
          }
        },
        error: () => {
          alert(
            "Une erreur est survenue lors du chargement des méthodes de paiement."
          );
        },
      });
    },

    displayPaymentMethods() {
      const paymentMethodsContainer = $("#modePaiement");
      paymentMethodsContainer.empty();

      if (
        Array.isArray(this.globalPaymentMethods) &&
        this.globalPaymentMethods.length > 0
      ) {
        this.globalPaymentMethods.forEach((method) => {
          const methodElement = `<option value="${method.nom}">${method.label}</option>`;
          paymentMethodsContainer.append(methodElement);
        });
      } else {
        paymentMethodsContainer.append(
          "<option disabled>Aucune méthode de paiement disponible</option>"
        );
      }
    },

    showConfirmationMessage() {
      const confirmationHtml = `
      <div class="d-flex align-items-center justify-content-center mb-4">
        <img src="${mr_config.confirmation_image_url}" alt="Confirmation" style="width: 50px; height: auto; margin-right: 15px;">
        <p class="mb-0" style="font-size: 1.1em; color: #ffffff;">
          Votre réservation a été enregistrée avec succès, et un e-mail de confirmation vous a été envoyé.
          Connectez-vous à votre compte utilisateur pour suivre l'évolution de votre réservation et consulter les détails.
        </p>
      </div>
      <div class="d-flex justify-content-center mt-4">
        <button onclick="window.location.href='${mr_config.home_url}'" class="btn-custom-secondary me-3">Accueil</button>
        <button onclick="window.location.href='${mr_config.account_url}'" class="btn-custom-primary">Mon Compte</button>
      </div>
    `;
      $("#step-6-content .card-body").html(confirmationHtml);
    },

    formatCapaciteChargement(capaciteChargement) {
      const [nombre, type] = capaciteChargement.split(" ");
      let typeDescription = "";

      switch (type) {
        case "Cabine":
          typeDescription = "Bagage cabine";
          break;
        case "M":
          typeDescription = "Valise moyenne";
          break;
        case "L":
          typeDescription = "Valise large";
          break;
        case "XL":
          typeDescription = "Valise extra-large";
          break;
        default:
          typeDescription = type;
      }

      return `${nombre} ${typeDescription}`;
    },

    displayVehicules(vehicules) {
      const vehiculeList = $("#vehicule-list");
      vehiculeList.empty();
      if (Array.isArray(vehicules) && vehicules.length > 0) {
        vehicules.forEach((vehicule) => {
          const imageSrc =
            vehicule.galerie || mr_config.default_vehicle_image_url;
          const prixVehicule = this.getPrixReservation(vehicule.id) || 0;
          const selectedClass =
            this.selectedVehicule &&
              this.selectedVehicule.vehicule === vehicule.id
              ? "selected"
              : "";

          const capaciteChargementFormatee = this.formatCapaciteChargement(
            vehicule.capacite_chargement
          );

          const marqueModele =
            `${vehicule.marque} ${vehicule.modele}`.toUpperCase();

          vehiculeList.append(`
            <div class="vehicle-card ${selectedClass}">
              <div class="vehicle-image-wrapper">
                <img src="${imageSrc}" alt="${marqueModele}" class="vehicle-image">
              </div>
              <div class="vehicle-details">
                <h5 class="vehicle-title">${marqueModele}</h5>
                <p class="vehicle-capacity">👥 ${vehicule.capacite_passagers} passagers | 🧳 ${capaciteChargementFormatee}</p>
                <div class="vehicle-price-tag">
                  ${prixVehicule.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
                </div>
                <button class="choisir-vehicule" data-vehicule-id="${vehicule.id}">Choisir</button>
              </div>
            </div>`);
        });
        $(".choisir-vehicule").on("click", (event) =>
          this.toggleSelection($(event.currentTarget).data("vehicule-id"))
        );
      } else {
        vehiculeList.append(
          '<div class="no-vehicules">Aucun véhicule disponible</div>'
        );
      }
    },

    displaySupplements() {
      const supplementsList = $("#supplements-list");
      supplementsList.empty();
      if (
        this.selectedVehicule &&
        Array.isArray(this.supplements) &&
        this.supplements.length > 0
      ) {
        this.supplements.forEach((supplement, index) => {
          supplementsList.append(`
            <div class="supplement-item">
              <p class="supplement-text">${this.escapeHtml(supplement.nom_attribut)
            } - ${supplement.prix_unitaire_attribut.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}</p>
              <div class="supplement-controls">
                <button class="btn-supplement-minus" data-index="${index}" ${supplement.quantite <= 0 ? "disabled" : ""
            }>-</button>
                <input type="number" class="supplement-input" value="${supplement.quantite
            }" min="0" max="${supplement.nombre_maximum}" readonly />
                <button class="btn-supplement-plus" data-index="${index}" ${supplement.quantite >= supplement.nombre_maximum ? "disabled" : ""
            }>+</button>
              </div>
            </div>`);
          $(`.btn-supplement-minus[data-index="${index}"]`).on("click", () =>
            this.updateSupplementQuantity(index, -1)
          );
          $(`.btn-supplement-plus[data-index="${index}"]`).on("click", () =>
            this.updateSupplementQuantity(index, 1)
          );
        });
      } else {
        supplementsList.append(
          '<div class="no-supplements">Aucun supplément disponible</div>'
        );
      }
    },

    updateSupplementQuantity(index, delta) {
      if (
        this.supplements[index].quantite + delta >= 0 &&
        this.supplements[index].quantite + delta <=
        this.supplements[index].nombre_maximum
      ) {
        this.supplements[index].quantite += delta;
        this.calculateTotalCost();
        this.displaySupplements();
        this.addSupplementsToReservationTab();
      }
    },

    addSupplementsToReservationTab() {
      const supplementsArray = this.supplements.map((supplement) => ({
        nom_attribut: supplement.nom_attribut,
        nombre_maximum: supplement.nombre_maximum,
        prix_unitaire_attribut: supplement.prix_unitaire_attribut,
        quantite: supplement.quantite,
      }));

      this.reservation_tab.supplements = supplementsArray;
    },

    calculateTotalCost() {
      const totalSupplementsCost = this.supplements.reduce(
        (total, supplement) =>
          total + supplement.prix_unitaire_attribut * supplement.quantite,
        0
      );
      this.reservation_tab.totalAttributCost = totalSupplementsCost;
      this.reservation_tab.coutTotalReservation =
        (this.reservation_tab.coutTransport || 0) + totalSupplementsCost;
    },

    toggleSelection(vehiculeId) {
      const vehicule = this.transportEstimates.find(
        (e) => e.vehicule === vehiculeId
      );
      if (!vehicule) return;
      if (
        this.selectedVehicule &&
        this.selectedVehicule.vehicule === vehiculeId
      ) {
        this.selectedVehicule = null;
        delete this.reservation_tab.typeVehicule;
        delete this.reservation_tab.coutTransport;
        delete this.reservation_tab.coutMajorer;
        delete this.reservation_tab.vehicule;
        delete this.reservation_tab.capaciteChargement;
        delete this.reservation_tab.typeBagages;
        delete this.reservation_tab.capacitePassagers;
      } else {
        this.selectedVehicule = vehicule;
        this.reservation_tab.typeVehicule = vehicule.transport_type;
        this.reservation_tab.coutTransport = vehicule.cout || 0;
        this.reservation_tab.coutMajorer = vehicule.cout_majoration || 0;
        this.reservation_tab.vehicule = vehicule.vehicule;
        const capaciteChargementParts = vehicule.capacite_chargement.split(" ");
        if (capaciteChargementParts.length === 2) {
          this.reservation_tab.capaciteChargement = parseInt(
            capaciteChargementParts[0],
            10
          );
          this.reservation_tab.typeBagages = this.formatTypeBagages(
            capaciteChargementParts[1]
          );
        }
        this.reservation_tab.capacitePassagers = parseInt(
          vehicule.capacite_passagers,
          10
        );
      }
      this.displayVehicules(this.vehiculesStockes);
      this.displaySupplements();
    },

    formatPaymentMethodName(method) {
      const methods = {
        payement_paypal: "Paiement par PayPal",
        payement_stripe: "Paiement par Stripe",
        payement_abord: "Paiement à bord (espèces ou carte)",
        payement_virement: "Paiement par virement bancaire",
        payment_en_compte: "Paiement en compte",
      };
      return methods[method] || method;
    },

    getPrixReservation(vehiculeId) {
      const estimate = this.transportEstimates.find(
        (e) => e.vehicule === vehiculeId
      );
      return estimate ? estimate.cout : 0;
    },

    disablePastDates() {
      const today = new Date().toISOString().split("T")[0];
      document
        .getElementById("datePriseEnChargeDate")
        .setAttribute("min", today);
    },

    initGoogleComponents() {
      if (typeof google === "object" && typeof google.maps === "object") {
        this.initMapForStep(1, "mr-map");
        this.initAutocomplete();
        this.initAutocompleteForAddresses(); // Ajoutez cet appel
      } else {
        setTimeout(() => this.initGoogleComponents(), 100);
      }
    },

    initAutocompleteForAddresses() {
      const addressFields = [
        "simple_adresse",
        "agency_adresse",
        "company_adresse",
        "adresse_societe",
        "adresse_agence",
      ];

      addressFields.forEach((fieldId) => {
        const addressInput = document.getElementById(fieldId);
        if (addressInput) {
          const autocomplete = new google.maps.places.Autocomplete(
            addressInput,
            {
              types: ["address"],
              componentRestrictions: {
                country: "fr",
              },
            }
          );
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            addressInput.value = place.formatted_address;
          });
        }
      });
    },

    updateStep3Fields() {
      const nombrePassagerSelect = $("#nombrePassager");
      nombrePassagerSelect.empty();
      nombrePassagerSelect.append(
        '<option value="" disabled selected>Nombre de passagers</option>'
      );
      for (let i = 1; i <= this.reservation_tab.capacitePassagers; i++) {
        nombrePassagerSelect.append(
          `<option value="${i}">${i} Passager${i > 1 ? "s" : ""}</option>`
        );
      }

      const capaciteChargementSelect = $("#capaciteChargement");
      capaciteChargementSelect.empty();
      capaciteChargementSelect.append(
        '<option value="" disabled selected>Nombre de bagages</option>'
      );
      for (let i = 0; i <= this.reservation_tab.capaciteChargement; i++) {
        capaciteChargementSelect.append(`<option value="${i}">${i}</option>`);
      }

      $("#typeBagages")
        .val(this.reservation_tab.typeBagages || "")
        .attr("placeholder", "Type de bagages");

      const modePaiementSelect = $("#modePaiement");
      modePaiementSelect.empty();
      modePaiementSelect.append(
        '<option value="" disabled selected>Méthode de paiement</option>'
      );
      if (
        Array.isArray(this.globalPaymentMethods) &&
        this.globalPaymentMethods.length > 0
      ) {
        this.globalPaymentMethods.forEach((method) => {
          modePaiementSelect.append(
            `<option value="${method.nom}">${method.label}</option>`
          );
        });
      } else {
        modePaiementSelect.append(
          "<option disabled>Aucune méthode de paiement disponible</option>"
        );
      }

      $("#compagnieAerienne")
        .val(this.reservation_tab.compagnieAerienne || "")
        .attr("placeholder", "Numéro de vol ou train (facultatif)");
      $("#numero_dossier")
        .val(this.reservation_tab.numeroDossier || "")
        .attr("placeholder", "Référence de votre dossier (facultatif)");
      $("#note")
        .val(this.reservation_tab.note || "")
        .attr(
          "placeholder",
          "Ajoutez des informations complémentaires (facultatif)"
        );
    },

    initAutocomplete() {
      const departInput = document.getElementById("departAddress");
      const destinationInput = document.getElementById("destinationAddress");
      const departAutocomplete = new google.maps.places.Autocomplete(
        departInput
      );
      const destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput
      );
      departAutocomplete.addListener("place_changed", () =>
        this.checkAddresses()
      );
      destinationAutocomplete.addListener("place_changed", () =>
        this.checkAddresses()
      );
    },

    checkAddresses() {
      const departAddress = $("#departAddress").val();
      const destinationAddress = $("#destinationAddress").val();
      if (departAddress && destinationAddress) {
        this.afficherTrajetForStep(1, departAddress, destinationAddress);
        $("#date-time-fields").slideDown();
      } else {
        $("#date-time-fields").slideUp();
      }
    },

    validateStep3Fields() {
      const requiredFields = {
        nombrePassagers: $("#nombrePassager").val(),
        capaciteChargement: $("#capaciteChargement").val(),
        modePaiement: $("#modePaiement").val(),
      };

      for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) {
          alert(
            `Veuillez sélectionner ${key
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()}.`
          );
          return false;
        }
      }

      Object.assign(this.reservation_tab, {
        ...requiredFields,
        typeBagages: $("#typeBagages").val(),
        compagnieAerienne: $("#compagnieAerienne").val(),
        numeroDossier: $("#numero_dossier").val(),
        note: $("#note").val(),
        passengers: $("#passenger-list .passenger-entry")
          .map((_, entry) => ({
            name: $(entry).find(".passenger-name").val(),
            phone: $(entry).find(".passenger-phone").val(),
          }))
          .get(),
      });

      // **Ajoutez ce log pour vérifier les données après validation**
      console.log("Données de réservation_tab après validation :", this.reservation_tab);

      return true;
    },

    initMapForStep(step, containerId) {
      // Initialiser la carte pour une étape spécifique
      const customMapStyles = [
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [
            {
              color: "#333333",
            },
          ],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [
            {
              color: "#ffffff",
            },
            {
              lightness: 100,
            },
          ],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [
            {
              color: "#000000",
            },
          ],
        },
        // Ajoutez d'autres styles selon vos préférences
      ];
      if (!this.mapInstances[step]) {
        const container = document.getElementById(containerId);
        const map = new google.maps.Map(container, {
          center: {
            lat: 48.8566,
            lng: 2.3522,
          }, // Coordonnées de Paris par défaut
          zoom: 10,
          styles: customMapStyles, // Appliquer les styles personnalisés
        });
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer.setMap(map);

        // Sauvegarder les instances pour cette étape
        this.mapInstances[step] = {
          map,
          directionsService,
          directionsRenderer,
        };
      } else {
        // Si la carte est déjà initialisée, forcer le redimensionnement
        google.maps.event.trigger(this.mapInstances[step].map, "resize");
      }
    },

    // Afficher le trajet sur la carte pour une étape spécifique
    afficherTrajetForStep(step, departAddress, destinationAddress) {
      const { directionsService, directionsRenderer } =
        this.mapInstances[step] || {};
      if (directionsService && directionsRenderer) {
        const request = {
          origin: departAddress,
          destination: destinationAddress,
          travelMode: "DRIVING",
        };

        directionsService.route(request, (result, status) => {
          if (status === "OK") {
            directionsRenderer.setDirections(result);
          } else {
            alert("Erreur : impossible de calculer le trajet.");
          }
        });
      }
    },
  };

  $(document).ready(() => {
    ReservationModule.init();
  });
})(jQuery);
