
import { AfterViewChecked, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { CrmService } from '../../../utilitaires/services/crm.service';
import { WebsocketService } from '../../../utilitaires/services/websocket.service';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import 'add-to-calendar-button';

interface StatusTag {
  severity?: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast';
  value: string;
}

declare var google: any;

@Component({
  selector: 'app-detail-reservation',
  templateUrl: './detail-reservation.component.html',
  styleUrls: ['./detail-reservation.component.css']
})
export class DetailReservationComponent implements OnInit, AfterViewChecked {

  @ViewChild('mapContainer', { static: false }) gmap!: ElementRef;
  map: any;
  carte: any;
  lat = 45.75;
  lng = 4.85;
  compensationEnabled: boolean = false;
  isCommissionByAmount: boolean = false;

  typeReglement: any
  selectedType!: string;
  selectedSubType!: string;
  sendData: boolean = false;
  codeVerification = "";
  breadcrumbItems: MenuItem[] = [];
  loading: boolean = false;
  calForm: FormGroup;
  statutForm: FormGroup;
  telForm!: FormGroup;
  affichageForm!: FormGroup;
  reservationId!: number;
  reservation?: any;
  clientDetails: any;
  vehiculeData: any;
  description: string = "";
  title: string = "";
  startTime: string = "";
  startDate: string = "";
  endDate: string = "";
  endTime: string = "";
  location: string = "";
  lieuxPriseEnChargeLat!: number;
  lieuxPriseEnChargeLng!: number;
  lieuxDestinationLat!: number;
  lieuxDestinationLng!: number;
  coutVente: any;
  cout: any;
  errorMessage = "";
  successMessage = "";
  isChangerStatut: boolean = false;
  actionEnCours: string = '';
  display: boolean = false;
  visible: boolean = false;
  userType!: string | null;
  confirmationVisible: boolean = false;
  confirmationMessage: string = '';
  selectedAction: string = '';

  messageExplicatif: string = '';
  confirmationUrgentVisible: boolean = false;
  requeteAnnulationVisible: boolean = false;
  annulationVisible: boolean = false;
  confirmationRequeteVisible: boolean = false;
  confirmationNoShowVisible: boolean = false;
  confirmationReglementVisible: boolean = false;
  confirmationEnApprocheVisible: boolean = false;
  serviceClientInfo: any

  cards = [
    {
      type: "pdf",
      title: "PDF",
      subtitle: "Télécharger en PDF",
      badgeClass: "flex align-items-center justify-content-center bg-red-100 border-round",
      icon: "pi pi-file-pdf text-red-500 text-xl",
    },
    {
      type: "mail",
      title: "Mail",
      subtitle: "Envoyer par Mail",
      badgeClass: "flex align-items-center justify-content-center bg-cyan-100 border-round",
      icon: "pi pi-envelope text-cyan-500 text-xl",
    },
    {
      type: "whatsapp",
      title: "WhatsApp",
      subtitle: "Envoyer par WhatsApp",
      badgeClass: "flex align-items-center justify-content-center bg-green-100 border-round",
      icon: "pi pi-whatsapp text-green-500 text-xl",
    },
  ];

  cardsFille = [
    {
      type: "commande",
      title: "Bon",
      subtitle: "De Commande",
      badgeClass: "flex align-items-center justify-content-center bg-cyan-100 border-round",
      icon: "BC",
    },
/*     {
      type: "disponibilite",
      title: "Bon",
      subtitle: "De Disponibilite",
      badgeClass: "flex align-items-center justify-content-center bg-yellow-100 border-round",
      icon: "BD",
    }, */
    {
      type: "annulation",
      title: "Bon",
      subtitle: "D'Annulation",
      badgeClass: "flex align-items-center justify-content-center bg-red-100 border-round",
      icon: "BA",
    },
  ];

  cardBonAnnulation = [
    {
      type: "client",
      title: "Client",
      subtitle: "Bon d'annulation pour client",
      badgeClass: "flex align-items-center justify-content-center bg-blue-100 border-round",
      icon: "Cl",
    },
/*     {
      type: "chauffeur",
      title: "Chauffeur",
      subtitle: "Bon d'annulation pour chauffeur",
      badgeClass: "flex align-items-center justify-content-center bg-yellow-100 border-round",
      icon: "CH",
    }, */
    {
      type: "autre",
      title: "Autre",
      subtitle: "Bon d'annulation pour autre",
      badgeClass: "flex align-items-center justify-content-center bg-red-100 border-round",
      icon: "AU",
    },
  ];

  cardBonCommande = [
    {
      type: "client",
      title: "Client",
      subtitle: "Bon de commande pour client",
      badgeClass: "flex align-items-center justify-content-center bg-blue-100 border-round",
      icon: "CL",
    },
    {
      type: "autre",
      title: "Autre",
      subtitle: "Bon de commande pour autre",
      badgeClass: "flex align-items-center justify-content-center bg-red-100 border-round",
      icon: "AU",
    },
  ];

  cardBonDisponibilite = [
    {
      type: "chauffeur",
      title: "Chauffeur",
      subtitle: "Bon de disponibilite pour chauffeur",
      badgeClass: "flex align-items-center justify-content-center bg-yellow-100 border-round",
      icon: "CH",
    },
  ];

  showInitialCards = true;
  selectedCardType: string | null = null;
  selectedMainCardType!: string;
  emailForm!: FormGroup;
  isEmailForm: boolean = false;
  isWhasapForm: boolean = false;
  isValidation: boolean = false;
  isCom: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _estimationService: CrmService,
    private _reservationService: CrmService,
    private messageService: MessageService,
    private websocketService: WebsocketService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private http: HttpClient,
    private router: Router
  ) {
    this.calForm = this.fb.group({
      commission: [10],
      compensation: [0],
      commissionAmount: [0],
      coutDeVente: [''],
    });

    this.telForm = this.fb.group({
      telephone: ["", [Validators.required, Validators.minLength(8)]],
    });
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.statutForm = this.fb.group({
      nouveauStatut: [""],
    });
    this.affichageForm = this.fb.group({
      supplements: [[]],
      passagers: [[]],
      notes: [[]],
    });
  }

  ngOnInit() {
    this.getReservation();
    this.userType = this._estimationService.getUserType();
    this.breadcrumbItems = [];
    this.breadcrumbItems.push({ label: 'Reservations' });
    this.breadcrumbItems.push({ label: 'Detail' });
    if (this.userType === 'client') {
      this.getServiceClient(1);  // ID par défaut 1
    }
  }

  ngAfterViewInit() {
    /*     // Initialisation de la carte une fois que l'élément gmap est prêt
        this.initializeMap().then(() => {
          console.log('Carte initialisée avec succès');
        }).catch((error: any) => {
          console.error('Erreur lors de l\'initialisation de la carte:', error);
        }); */
  }

  getServiceClient(id: number): void {
    this._estimationService.getServiceClientById(id).subscribe(
      (data) => {
        this.serviceClientInfo = data;
      },
      (error) => {
        console.error("Erreur lors de la récupération des informations du service client", error);
      }
    );
  }

  navigateToDashboard = () => {
    this.router.navigate(['/app/reservations']);
  }

  private initializeMap(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Vérification si l'élément gmap et son nativeElement sont présents
      if (!this.gmap || !this.gmap.nativeElement) {
        return;
      }

      const mapOptions = {
        center: new google.maps.LatLng(this.lat, this.lng),
        zoom: 10,
      };
      this.map = new google.maps.Map(this.gmap.nativeElement, mapOptions);

      // Affichage de l'itinéraire par défaut
      if (this.reservation) {
        const defaultStart = this.reservation?.lieuxPriseEnCharge;
        const defaultEnd = this.reservation?.lieuxDestination;

        this.displayDefaultRoute(defaultStart, defaultEnd);
      }

      resolve();
    });
  }

  private displayDefaultRoute(defaultStart: string, defaultEnd: string): void {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map });

    directionsService.route(
      {
        origin: defaultStart,
        destination: defaultEnd,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result: any, status: any) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          console.error('Erreur de routage:', status);
        }
      }
    );
  }

  getReservation(): void {
    const id = this.route.snapshot.params["id"];
    this.reservationId = id;
    this._reservationService.getReservation(id).subscribe((reservation) => {
      this.reservation = reservation;
      console.log("reservation", reservation);

      // Mise à jour des formulaires d'affichage et autres opérations
      this.updateAffichageForm();
      this.clientDetails = reservation.utilisateur;
      this.vehiculeData = reservation.vehicule;
      this.cout = reservation.coutTotalReservation;

      this.statutForm.patchValue({
        nouveauStatut: this.reservation.statutReservation,
      });

      this.getCoordinates(this.reservation.lieuxPriseEnCharge).subscribe(
        (priseEnChargeCoords) => {
          this.lieuxPriseEnChargeLat = priseEnChargeCoords.lat;
          this.lieuxPriseEnChargeLng = priseEnChargeCoords.lng;
        }
      );

      this.getCoordinates(this.reservation.lieuxDestination).subscribe(
        (destinationCoords) => {
          this.lieuxDestinationLat = destinationCoords.lat;
          this.lieuxDestinationLng = destinationCoords.lng;
        }
      );
      // Convertir la date au fuseau horaire de la France (Europe/Paris) et formatage de la date
      if (reservation.datePriseEnCharge) {
        const dateObject = new Date(reservation.datePriseEnCharge);
        this.startDate = dateObject.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
        const time = new Intl.DateTimeFormat('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Paris'
        }).format(dateObject);
        this.startTime = time;

        this.endDate = this.startDate;
        this.endTime = this.calculateEndTime(this.startTime);
      } else {
        // Handle case where datePriseEnCharge is empty or undefined
        this.startDate = "";
        this.startTime = "00:00"; // Default to "00:00"
        this.endDate = "";
        this.endTime = "00:00";
      }

      const vehicule = reservation.typeReservation !== null ? reservation.typeReservation : '???';
      const numero_reservation = reservation.numero_reservation !== null ? reservation.numero_reservation : reservation.id;
      const lieux = reservation.lieuxPriseEnCharge !== null ? reservation.lieuxPriseEnCharge : 'lyon, France';

      this.title = `${vehicule}(${numero_reservation})`;
      this.location = lieux;
      const tarifValue = typeof reservation.coutTotalReservation === 'number' && !isNaN(reservation.coutTotalReservation)
        ? reservation.coutTotalReservation.toString() : '???';
      const formattedDatePriseEnCharge = reservation.datePriseEnCharge ? this.datePipe.transform(reservation.datePriseEnCharge, 'dd MMMM yyyy - HH:mm', 'fr') : '???';

      const formattedVehicule = `${this.vehiculeData.marque} ${this.vehiculeData.modele} (${this.vehiculeData.typeVehicule})`;
      let descriptionParts: any[] = [];
      const addLine = (line: string) => descriptionParts.push(line + '\n');

      addLine(`Détails de la réservation :`);
      formattedDatePriseEnCharge && addLine(`Date et Heure: ${formattedDatePriseEnCharge}`);
      reservation.lieuxPriseEnCharge && addLine(`Adresse de départ : ${reservation.lieuxPriseEnCharge}`);
      reservation.lieuxDestination && addLine(`Adresse de destination : ${reservation.lieuxDestination}`);
      reservation.nombrePassager && addLine(`Nombre de passagers : ${reservation.nombrePassager}`);
      reservation.nombreBagage && addLine(`Nombre de bagages : ${reservation.nombreBagage}`);
      reservation.compagnieAerienne && reservation.compagnieAerienne !== 'nan' && addLine(`Numéro de vol ou de train : ${reservation.compagnieAerienne}`);
      formattedVehicule && addLine(`Vehicule : ${formattedVehicule}`);
      tarifValue && tarifValue !== 'nan' && addLine(`Tarif de la course : ${tarifValue}€`);

      addLine('\nInformations du client :');
      (reservation.utilisateur.last_name || (reservation.utilisateur.first_name && reservation.utilisateur.first_name !== 'XXXXX')) &&
        addLine(`Nom : ${reservation.utilisateur.last_name ? reservation.utilisateur.last_name : ''} ${reservation.utilisateur.first_name && reservation.utilisateur.first_name !== 'XXXXX' ? reservation.utilisateur.first_name : ''}`);
      reservation.utilisateur.telephone && addLine(`Contact : ${reservation.utilisateur.telephone}`);
      reservation.utilisateur.email && addLine(`E-mail : ${reservation.utilisateur.email}`);
      this.description = descriptionParts.join('');
    });

    // Afficher l'itinéraire maintenant que la carte est initialisée
  }

  getCoordinates(address: string) {
    const apiKey = "AIzaSyBEilIuILbArteSd2h21UUMcTsolLJiQPw"; // Remplacez par votre clé API Google Maps
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;
    return this.http.get(geocodingUrl).pipe(
      map((response: any) => {
        if (response.results && response.results.length > 0) {
          const location = response.results[0].geometry.location;
          return location;
        }
        return null;
      })
    );
  }

  calculateEndTime(startTime: string): string {
    // Séparez l'heure et les minutes de startTime
    const [startHour, startMinute] = startTime.split(":");

    // Convertissez-les en nombres
    const startHourNum = parseInt(startHour, 10);
    const startMinuteNum = parseInt(startMinute, 10);

    // Ajoutez 1 heure et 30 minutes
    let endHourNum = startHourNum + 1;
    let endMinuteNum = startMinuteNum + 30;

    // Gérez le cas où les minutes dépassent 60
    if (endMinuteNum >= 60) {
      endHourNum++;
      endMinuteNum -= 60;
    }

    // Convertissez les heures et minutes en chaîne de caractères
    const endHour = endHourNum.toString().padStart(2, "0"); // Assurez-vous qu'il a toujours 2 chiffres
    const endMinute = endMinuteNum.toString().padStart(2, "0"); // Assurez-vous qu'il a toujours 2 chiffres

    // Créez endTime au format "HH:mm"
    const endTime = `${endHour}:${endMinute}`;

    return endTime;
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

  getFormattedStatus(status: string): string {
    switch (status) {
      case "en_attente":
        return "En Attente";
      case "en_traitement":
        return "En Traitement";
      case "affecter_a_chauffeur":
        return "Affecté à Chauffeur";
      case "affecter_a_partenaire":
        return "Affecté à Partenaire";
      case "non_affecter":
        return "Non Affecté";
      case "chauffeur_notifier":
        return "Chauffeur Notifié";
      case "en_approche":
        return "En Approche";
      case "en_cours":
        return "En Cours";
      case "terminer":
        return "Terminé";
      default:
        return status; // Retourne le statut original si non reconnu
    }
  }

  showSuccess(detail: string): void {
    this.messageService.add({ severity: 'success', summary: 'Succès', detail, life: 10000 });
  }

  showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail, life: 10000 });
  }


  changerStatut() {
    const nouveauStatut = this.statutForm.get("nouveauStatut")?.value;
    // Convertissez nouveauStatut en format non formaté si nécessaire
    this.loading = true;

    setTimeout(() => {
      this._reservationService
        .changerStatut(this.reservationId, nouveauStatut)
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.successMessage = "Statut de Réservation changer avec succès";
            this.showSuccess(this.successMessage)
            location.reload()
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = "Erreur lors de la mise a jour du statut de la réservation";
            this.showError(this.errorMessage)
            console.error("Erreur lors de la mise à jour du statut", error);
            location.reload()
          },
        });
    }, 1000);
  }



  ouvrirModal(type: any, reglementType: string) {
    this.typeReglement = reglementType; // Stocker le type de règlement (chauffeur ou partenaire)
    this.showDialog(type);
  }


  annulerReservation(action: "cancel" | "restore") {
    if (this.reservation && this.reservation.id) {
      this.loading = true;
      setTimeout(() => {
        this._reservationService
          .annulerReservation(this.reservationId, action)
          .subscribe({
            next: (response) => {
              this.router.navigate(["/app/reservations"]);
              this.loading = false;
              this.successMessage = "Réservation annulée avec succès";
              this.showSuccess(this.successMessage)
            },
            error: (error) => {
              this.loading = false;
              this.errorMessage = "Erreur lors de l'annulation de la réservation";
              this.showError(this.errorMessage)
              console.error(error);
              // Gérer l'erreur
            },
          });
      }, 1000);
    }
  }

  generatePDF(pdfType: string): void {
    // Commencer le chargement
    this.loading = true;

    setTimeout(() => {
      switch (pdfType) {
        case "commande":
          this._reservationService.generatePDF(this.reservationId);
          break;
        case "disponibilite":
          this._reservationService.BonDeDisponibilitePDF(this.reservationId);
          break;
        case "annulation":
          this._reservationService.BonAnnulationPDF(this.reservationId);
          break;
      }
      this.loading = false;
    }, 500); // Délai de 1 milliseconde
  }


  getSubCards(selectedType: string): any[] {
    switch (selectedType) {
      case "annulation":
        return this.cardBonAnnulation;
      case "commande":
        return this.cardBonCommande;
      case "disponibilite":
        return this.cardBonDisponibilite;
      default:
        return [];
    }
  }

  shouldDisplayClientCard(): boolean {
    if (this.selectedMainCardType === "mail") {
      return !!this.clientDetails.email;
    } else if (this.selectedMainCardType === "whatsapp") {
      return !!this.clientDetails.telephone;
    }
    return true; // Retourne true par défaut si aucun des cas ci-dessus ne correspond
  }

  WhatsApp(selectedType: any, subCardType: any): void {
    if (selectedType && subCardType) {
      const text = this.genererFichierTXT(selectedType);
      const message = `${text}`;
      const encodedMessage = encodeURIComponent(message);
      if (this.reservation) {
        let phoneNumber = "";
        // Sélectionnez le numéro en fonction du type de personne
        switch (subCardType) {
          case "chauffeur":
            phoneNumber = this.telForm.get("telephone")?.value;
            break;
          case "client":
            phoneNumber = this.clientDetails.telephone;
            break;
          case "autre":
            phoneNumber = this.telForm.get("telephone")?.value;
            break;
          default:
            console.log("Type de personne non spécifié.");
            return;
        }
        const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(url, "_blank");
        this.telForm.get("telephone")?.setValue("");
      }
    } else {
      console.log(
        "Veuillez sélectionner un type de bon et un type de personne."
      );
      this.telForm.get("telephone")?.setValue("");
    }
  }

  genererFichierTXT(typeBon: string): string {
    let formattedText = "";
    const usr = this.clientDetails;
    const reservation = this.reservation;

    // Fonction pour ajouter des lignes seulement si la valeur existe
    const addLine = (value: any, label: string) =>
      value ? `${label}: ${value}\n` : "";
    const addEmptyLine = () => `\n`;

    if (typeBon === "commande") {
      let reservationDetails = `BON DE COMMANDE\n\n`;
      reservationDetails += addEmptyLine();
      reservationDetails += `Service de voiture de transport avec chauffeur\n`;
      reservationDetails += `Billet collectif : Arrêté du 14 Février 1986 - Article 5\n`;
      reservationDetails += `Ordre de mission : Arrêté du 6 Janvier 1993 - Article 3\n`;
      reservationDetails += addEmptyLine();
      reservationDetails += `${this.formatterDate(
        reservation.datePriseEnCharge
      )}\n`;
      reservationDetails += addEmptyLine(); // Ajoute un saut de ligne
      reservationDetails += `D: ${reservation.lieuxPriseEnCharge || ""}\n`;
      reservationDetails += `A: ${reservation.lieuxDestination || ""}\n`;
      reservationDetails += addLine(
        reservation.typeReservation,
        `Type de véhicule`
      );
      reservationDetails += `Pass: ${reservation.nombrePassager || ""}; Bags: ${reservation.nombreBagage || ""
        }\n`;
      let paymentDetails = `Mode de paiement : ${this.formatPaymentMethodName(
        reservation.modePaiement
      )}\n`;
      paymentDetails += `Tarif : €${reservation.coutTotalReservation || ""}\n`;
      paymentDetails += addEmptyLine(); // Ajoute un saut de ligne

      let clientDetails = `Nom : ${usr.last_name || ""} ${usr.first_name && usr.first_name !== 'XXXXX' ? usr.first_name : ''
        }\n`;
      clientDetails += addLine(usr.telephone, `Contact`);
      clientDetails += addLine(usr.email, `Email`);
      clientDetails += addEmptyLine(); // Ajoute un saut de ligne

      let additionalText = `Le tarif ci-dessus inclut toutes les charges: Parking, péage et attente du chauffeur à la prise en charge (15 minutes à la gare, 60 minutes à l'aéroport et 15 minutes aux autres adresses).\n`;
      additionalText += `Au-delà de ce temps d’attente, le client sera notifié avant le décompte du temps additionnel facturé. Les retards de train et d’avion ne sont pas facturés.\n`;
      additionalText += addEmptyLine(); // Ajoute un saut de ligne final

      // Assemblage du texte final
      formattedText = `${reservationDetails}${paymentDetails}${clientDetails}${additionalText}`;
    } else if (typeBon === "disponibilite") {
      let reservationDetails = `DEMANDE DE DISPONIBILITÉ\n\n`;
      reservationDetails += addEmptyLine();
      reservationDetails += `${this.formatterDate(
        reservation.datePriseEnCharge
      )}\n`;
      reservationDetails += addEmptyLine(); // Ajoute un saut de ligne
      reservationDetails += `D: ${reservation.lieuxPriseEnCharge || ""}\n`;
      reservationDetails += `A: ${reservation.lieuxDestination || ""}\n`;
      reservationDetails += addEmptyLine(); // Ajoute un saut de ligne
      reservationDetails += addLine(
        reservation.typeReservation,
        `Type de véhicule`
      );
      reservationDetails += `Pass: ${reservation.nombrePassager || ""}; Bags: ${reservation.nombreBagage || ""}\n`;
      reservationDetails += `Lieu de rendez-vous: ${reservation.lieu_rendez_vous || ""}\n`;
      // Calcul du prix en fonction du mode de paiement
      let prixReservation =
        reservation.modePaiement === "payement_abord"
          ? reservation.coutTotalReservation || "" // Utilisez coutTotalReservation si le mode de paiement est à bord
          : reservation.coutDeVente || ""; // Autrement, utilisez coutDeVente
      let paymentDetails = `Mode de paiement : ${this.formatPaymentMethodName(
        reservation.modePaiement
      )}\n`;
      paymentDetails += `Tarif de vente : €${reservation.coutDeVente}\n`;
      paymentDetails += `Tarif de la course : €${prixReservation}\n`;
      paymentDetails += addEmptyLine(); // Ajoute un saut de ligne final
      // Assemblage du texte final
      formattedText = `${reservationDetails}${paymentDetails}`;
    } else if (typeBon === "annulation") {
      let reservationDetails = `BON D'ANNULATION\n\n`;
      reservationDetails += addEmptyLine();
      reservationDetails += `En raison de certains inconvénients, la course, dont les informations suivent, est annulée\n`;
      reservationDetails += addEmptyLine();
      reservationDetails += `${this.formatterDate(
        reservation.datePriseEnCharge
      )}\n`;
      reservationDetails += addEmptyLine(); // Ajoute un saut de ligne
      reservationDetails += `D: ${reservation.lieuxPriseEnCharge || ""}\n`;
      reservationDetails += `A: ${reservation.lieuxDestination || ""}\n`;
      reservationDetails += addEmptyLine(); // Ajoute un saut de ligne
      reservationDetails += addLine(
        reservation.typeReservation,
        `Type de véhicule`
      );
      reservationDetails += `Pass: ${reservation.nombrePassager || ""}; Bags: ${reservation.nombreBagage || ""
        }\n`;
      let paymentDetails = `Mode de paiement : ${this.formatPaymentMethodName(
        reservation.modePaiement)}\n`;
      paymentDetails += `Tarif de vente : €${reservation.coutDeVente || ""}€\n`;
      paymentDetails += `Tarif de la course : €${reservation.coutTotalReservation || ""}€\n`;
      paymentDetails += addEmptyLine(); // Ajoute un saut de ligne final

      // Assemblage du texte final
      formattedText = `${reservationDetails}${paymentDetails}`;
    }
    return formattedText.trim();
  }

  formatPaymentMethodName(method: string): string {
    switch (method) {
      case "payement_paypal":
        return "Paiement par PayPal";
      case "payement_stripe":
        return "Paiement par Stripe";
      case "payement_abord":
        return "Paiement à bord (espèce ou CB)";
      case "payement_virement":
        return "Paiement par virement bancaire";
      case "payment_en_compte":
        return "Paiement en compte";
      default:
        return method;
    }
  }

  formatterDate(date: string): string {
    if (date) {
      // Convertir la date en objet Date UTC
      const dateObj = new Date(date);

      // Créer un objet Date qui représente la même date en UTC
      const utcDate = new Date(
        Date.UTC(
          dateObj.getUTCFullYear(),
          dateObj.getUTCMonth(),
          dateObj.getUTCDate(),
          dateObj.getUTCHours(),
          dateObj.getUTCMinutes()
        )
      );

      // Formatter la date en utilisant toLocaleDateString avec les options désirées
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: 'Europe/Paris'  // Spécifier le fuseau horaire UTC
      };

      // Retourner la date formatée
      return utcDate.toLocaleDateString("fr-FR", options);
    } else {
      return "???";
    }
  }

  delete(): void {
    if (this.reservationId) {
      this.loading = true;
      setTimeout(() => {
        this._reservationService.deleteReservation(this.reservationId).subscribe({
          next: (res) => {
            console.log(res, "la donnée a été supprimée avec succès");
            // Redirection vers la page de liste après la suppression
            this.successMessage = "la reservation a été supprimée avec succès";
            this.showSuccess(this.successMessage)
            this.loading = false;

            this.router.navigate(["app/reservations"]);
          },
          error: (e) => {
            console.error(e);
            this.loading = false;
            this.errorMessage = "Une erreur est survenu lors de la suppression de la reservation";
            this.showError(this.errorMessage)
          },
        });
      }, 1000);
    } else {
      console.error("Impossible de supprimer le client : ID non valide");
    }
  }

  verifyCode(action: any) {
    this._reservationService.getAllCodeVerification().subscribe(
      (response) => {
        // Vérifiez d'abord si la réponse contient au moins un élément
        if (response.length > 0) {
          const passStandard = response[0].pass_standard;

          if (this.codeVerification === passStandard) {
            this.errorMessage = "";
            if (action === "supprimer") {
              this.delete();
            } if (action === "supprimerPropagerOui") {
              this.manageReservation('supprimer', this.reservationId, true);
            } if (action === "supprimerPropagerNon") {
              this.manageReservation('supprimer', this.reservationId);
            } else if (action === "changer_statut") {
              this.changerStatut();
            } else if (action === "stop") {
              this.stopRecurring();
            }
            /* this._modalService.dismissAll(); */
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
          "Erreur lors de la récupération des codes de vérification :",
          error
        );
      }
    );
  }

  stopRecurring(): void {
    this.loading = true;
    setTimeout(() => {
      this._reservationService.stopRepetition(this.reservationId).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.showSuccess(this.successMessage)
          this.loading = false;
          this.router.navigate(["app/reservations"]);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.errorMessage = "Une erreur est survenu lors de l'arret de la recurence";
          this.showError(this.errorMessage)
        },
      });
    }, 1000);
  }


  private manageReservation(action: string, reservationId: number, propager?: boolean): void {
    this.loading = true;
    setTimeout(() => {
      this._reservationService.manageReservation(action, reservationId, propager).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.showSuccess(this.successMessage)
          this.loading = false;
          this.router.navigate(["app/reservations"]);
        },
        error: (e) => {
          console.error(e);
          this.loading = false;
          this.successMessage = "Une erreur est survenu lors de l'action sur la reservation";
          this.showError(this.errorMessage)
        },
      });
    }, 1000);
  }

  getStatusTag(reservation: any): StatusTag {
    if (!reservation.etat) {
      return { severity: 'danger', value: 'Annulé' };
    }

    let severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined;
    switch (reservation.statutReservation) {
      case 'en_attente':
      case 'non_affecter':
        severity = 'danger';
        break;
      case 'terminer':
        severity = 'success';
        break;
      case 'affecter_a_chauffeur':
        severity = 'info';
        break;
      case 'en_traitement':
        severity = 'secondary';
        break;
      case 'affecter_a_partenaire':
        severity = 'info';
        break;
      case 'chauffeur_notifier':
        severity = 'warning';
        break;
      case 'en_cours':
        severity = undefined; // Pas de severity pour "en_cours"
        break;
      default:
        severity = 'contrast';
    }

    return { severity, value: this.getFormattedStatus(reservation.statutReservation) };
  }

  private updateAffichageForm(): void {
    if (this.reservation) {
      this.affichageForm.patchValue({
        supplements: this.getSupplements() || [],
        passagers: this.getPassagers() || [],
        notes: this.getNotes() || [],
      });
    }
  }

  isContentVisible = false;  // Variable to track content visibility

  toggleVisibility() {
    this.isContentVisible = !this.isContentVisible;  // Toggle the visibility state
  }

  private getSupplements(): any[] {
    return this.reservation?.attribut?.filter((item: { quantite: number }) => item.quantite > 0) || [];
  }

  private getPassagers(): any[] {
    return this.reservation?.notes?.filter((note: { type: string }) => note.type === 'passenger') || [];
  }

  private getNotes(): any[] {
    return this.reservation?.notes?.filter((note: { type: string }) => note.type === 'note') || [];
  }

  ngAfterViewChecked() {
    if (!this.map && this.gmap) {
      this.initializeMap();
    }
  }


  openCodeVerificationModal(type: any, action: string) {
    this.actionEnCours = action; // Stockez l'action
    this.showDialog(type)
  }


  showDialog(type: 'changerStatut' | 'verifierCode' | 'whasapForm' | 'isValidation' | 'reglement' | 'com' | 'emailForm'): void {
    switch (type) {
      case 'changerStatut':
        this.isChangerStatut = true;
        break;
      case 'verifierCode':
        this.display = true;
        break;
      case 'whasapForm':
        this.isWhasapForm = true;
        break;
      case 'reglement':
        this.visible = true;
        break;
      case 'com':
        this.isCom = true;
        break;
      case 'isValidation':
        this.isValidation = true;
        break;
      case 'emailForm':
        this.isEmailForm = true;
        break;
    }
  }


  statuts: { label: string, value: string }[] = [
    { label: 'En Attente', value: 'en_attente' },
    { label: 'En Traitement', value: 'en_traitement' },
    { label: 'Affecté à Chauffeur', value: 'affecter_a_chauffeur' },
    { label: 'Affecté à Partenaire', value: 'affecter_a_partenaire' },
    { label: 'Non Affecté', value: 'non_affecter' },
    { label: 'Chauffeur Notifié', value: 'chauffeur_notifier' },
    { label: 'En Approche', value: 'en_approche' },
    { label: 'En Cours', value: 'en_cours' },
    { label: 'Terminé', value: 'terminer' },

  ];

  confirm2(event: Event, action: any) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Êtes-vous sûr de vouloir annulé cette reservation ?',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.annulerReservation(action)
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Annuler', detail: 'vous annulez l\'action ', life: 3000 });
      }
    });
  }

  confirm3(event: Event, action: any) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Voulez-vous annulez toutes les réservations associées a cette reservation reccurente?',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.manageReservation(action, this.reservationId, true);
      },
      reject: () => {
        this.manageReservation(action, this.reservationId, false);
      }
    });
  }

  confirm4(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Voulez-vous supprimer toutes les réservations associées a cette reservation reccurente?',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.openCodeVerificationModal('verifierCode', 'supprimerPropagerOui')
      },
      reject: () => {
        this.openCodeVerificationModal('verifierCode', 'supprimerPropagerNon')
      }
    });
  }

  toggleSendMode() {
    this.sendData = !this.sendData;
    if (this.sendData) {
      this.breadcrumbItems = [];
      this.breadcrumbItems.push({ label: 'Reservations' });
      this.breadcrumbItems.push({ label: 'Detail' });
      this.breadcrumbItems.push({ label: 'Envoyer Les Infomrations' });
    }
    else {
      this.breadcrumbItems = [];
      this.breadcrumbItems.push({ label: 'Reservations' });
      this.breadcrumbItems.push({ label: 'Detail' });
    }
  }


  // Ajoutez un paramètre pour indiquer si la sélection est une carte principale
  selectCard(cardType: string, isMainCard: boolean = false): void {
    if (isMainCard) {
      this.selectedMainCardType = cardType;
      this.selectedCardType = cardType;
    } else {
      this.selectedCardType = cardType;
    }
    this.showInitialCards = false;
  }

  resetView(): void {
    this.showInitialCards = true;
    this.selectedCardType = null;
  }

  openConfirmModal(selectedType: any, subCardType: any): void {
    this.selectedType = selectedType;
    this.selectedSubType = subCardType;

    if (subCardType === 'autre' && this.selectedMainCardType === 'mail') {
      this.showDialog('emailForm');
    } else {
      this.showDialog('isValidation');
    }
  }


  openConfirmationModal2(selectedType: any, subCardType: any) {
    this.selectedType = "";
    this.selectedSubType = "";

    this.selectedType = selectedType;
    this.selectedSubType = subCardType;
    this.showDialog('isValidation')
  }

  confirm(action: any): void {
    if (action === 'valider') {
      if (this.selectedMainCardType === 'whatsapp') {
        this.WhatsApp(this.selectedType, this.selectedSubType);
      } else if (this.selectedMainCardType === 'mail') {
        this.Email(this.selectedType, this.selectedSubType);
      }
    } else {
      this.telForm.get('telephone')?.setValue('');
      this.emailForm.get('email')?.setValue('');
      this.messageService.add({ severity: 'error', summary: 'Annulé', detail: 'Vous avez annulé l\'action', life: 3000 });
    }
  }


  Email(selectedType: any, subCardType: any): void {
    if (selectedType && subCardType) {
      if (this.reservation) {
        let email: string;
        // Sélectionnez l'adresse email en fonction du type de personne
        switch (subCardType) {
          case 'client':
            email = this.clientDetails.email;
            break;
          case 'autre':
            email = this.emailForm.get('email')?.value;
            break;
          default:
            console.log('Type de personne non spécifié.');
            return;
        }
        this.loading = true;
        setTimeout(() => {
          this._reservationService.sendEmail(selectedType, this.reservationId, email).subscribe(
            (response) => {
              this.emailForm.reset();
              this.isEmailForm = false;
              this.successMessage = response.message;
              this.showSuccess(this.successMessage);
              this.loading = false;
            },
            (error) => {
              console.error('Erreur lors de l\'envoi de l\'email:', error);
              this.isEmailForm = false;
              this.errorMessage = error.error.message || 'Erreur lors de l\'envoi de l\'e-mail.';
              this.showError(this.errorMessage);
              this.loading = false;
            }
          );
        }, 1000);
      }
    } else {
      console.log('Veuillez sélectionner un type de bon et un type de personne.');
      this.emailForm.reset();
    }
  }

  dataModal(contentType: string, selectedType: any, subCardType: any): void {
    this.selectedType = selectedType;
    this.selectedSubType = subCardType;

    if (contentType === 'contentAffectation') {
      this.messageService.add({
        severity: 'info',
        summary: 'Message',
        detail: 'Vous devez affecter un chauffeur à la course avant de pouvoir envoyer un message de disponibilité',
        life: 3000
      });
    } else if (contentType === 'whasapForm') {
      this.showDialog('whasapForm');
    } else if (contentType === 'emailForm') {
      this.showDialog('emailForm');
    }
  }


  markReservationAsRegler(): void {
    this.loading = true;

    setTimeout(() => {
      this._estimationService.markAsRegler(this.reservationId, this.typeReglement).subscribe({
        next: (response) => {
          this.showSuccess(`La réservation a été marquée comme réglée pour le ${this.typeReglement}.`);
          this.loading = false;
          location.reload();
        },
        error: (err) => {
          this.showError("Une erreur est survenue lors du marquage de la réservation.");
          this.loading = false;
          location.reload();
        }
      });
    }, 1500);
  }

  contactMenuItems = [
    { label: "Par WhatsApp", icon: 'pi pi-whatsapp', command: () => this.showConfirmationDialog('whatsapp') },
    { label: 'Appel Direct', icon: 'pi pi-mobile', command: () => this.showConfirmationDialog('phone') },
    { label: 'Par Mail', icon: 'pi pi-envelope', command: () => this.showConfirmationDialog('email') },
  ];

  serviceClientMenuItems = [
    { label: "Par WhatsApp", icon: 'pi pi-whatsapp', command: () => this.showConfirmationDialog('whatsapp') },
    { label: 'Appel Direct', icon: 'pi pi-mobile', command: () => this.showConfirmationDialog('phone') },
    { label: 'Par Mail', icon: 'pi pi-envelope', command: () => this.showConfirmationDialog('email') },
  ];


  getContactInfo(): { telephone: string, email: string } {
    if (this.userType === 'client' && this.serviceClientInfo) {
      return {
        telephone: this.serviceClientInfo.telephone,
        email: this.serviceClientInfo.email
      };
    } else {
      return {
        telephone: this.reservation.utilisateur.telephone,
        email: this.reservation.utilisateur.email
      };
    }
  }

  buildConfirmationMessage(action: string): string {
    const contactInfo = this.getContactInfo();
    switch (action) {
      case 'whatsapp':
        return `Voulez-vous vraiment contacter via WhatsApp au : ${contactInfo.telephone}?`;
      case 'phone':
        return `Voulez-vous vraiment appeler directement au : ${contactInfo.telephone}?`;
      case 'email':
        return `Voulez-vous vraiment envoyer un email à : ${contactInfo.email}?`;
      default:
        return '';
    }
  }

  showConfirmationDialog(action: string): void {
    this.selectedAction = action;
    this.confirmationMessage = this.buildConfirmationMessage(action);
    this.confirmationVisible = true;
  }

  confirmAction(): void {
    this.confirmationVisible = false;
    const contactInfo = this.getContactInfo();

    switch (this.selectedAction) {
      case 'whatsapp':
        this.contactViaWhatsApp(contactInfo.telephone);
        break;
      case 'phone':
        this.contactViaPhone(contactInfo.telephone);
        break;
      case 'email':
        this.contactViaEmail(contactInfo.email);
        break;
    }
  }

  contactViaWhatsApp(telephone: string): void {
    const phoneNumber = telephone.replace(/\s+/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, '_blank');
  }

  contactViaPhone(telephone: string): void {
    const phoneNumber = telephone.replace(/\s+/g, '');
    window.location.href = `tel:${phoneNumber}`;
  }

  contactViaEmail(email: string): void {
    window.location.href = `mailto:${email}`;
  }


  cancelMenuItems = [
    { label: "Annulation d'urgence", command: () => this.showUrgentAnnulationDialog() },
    { label: 'Requête d\'annulation', command: () => this.showRequeteAnnulationDialog() }
  ];

  // Show the dialog for Annulation d'urgence
  showUrgentAnnulationDialog(): void {
    this.confirmationUrgentVisible = true;
  }

  showAnnulationDialog(): void {
    this.annulationVisible = true;
  }

  demanderAnnulationClient(): void {
    this.annulationVisible = false;
    this.loading = true;
    setTimeout(() => {
      this._reservationService.demanderAnnulation({ reservation_id: this.reservation.id }).subscribe(
        (response) => {
          console.log('Demande d\'annulation réussie', response);
          this.loading = false;
          this.successMessage = 'Demande d\'annulation envoyée avec succès.';
          this.showSuccess(this.successMessage)
        },
        (error) => {
          this.loading = false;
          console.error('Erreur lors de la demande d\'annulation', error);
          this.errorMessage = 'Erreur lors de la demande d\'annulation.';
          this.showError(this.errorMessage)
        }
      );
    }, 1500);
  }

  // Show the dialog for Requête d'annulation (with input)
  showRequeteAnnulationDialog(): void {
    this.requeteAnnulationVisible = true;
  }
  // Confirm the input for Requête d'annulation
  confirmRequeteAnnulation(): void {
    this.requeteAnnulationVisible = false;
    this.confirmationRequeteVisible = true;
  }

  sendUrgentCancellation(): void {
    this.confirmationUrgentVisible = false;
    this.loading = true;

    setTimeout(() => {
      this._reservationService.demanderAnnulationChauffeur({
        reservation_id: this.reservation.id,
        type_annulation: 'annulation_urgente'
      })
        .subscribe({
          next: () => {
            this.showSuccess("Demande d'annulation d'urgence envoyée avec succès.");
            this.loading = false;
            setTimeout(() => location.reload(), 1500);
          },
          error: () => {
            this.showError("Une erreur est survenue lors de la demande d'annulation.");
            this.loading = false;
            setTimeout(() => location.reload(), 1500);
          }
        });
    }, 1500);
  }

  sendRequeteAnnulation(): void {
    this.confirmationRequeteVisible = false;
    this.loading = true;

    setTimeout(() => {
      this._reservationService.demanderAnnulationChauffeur({
        reservation_id: this.reservation.id,
        type_annulation: 'requete_annulation',
        message_explicatif: this.messageExplicatif
      })
        .subscribe({
          next: () => {
            this.showSuccess("Requête d'annulation envoyée avec succès.");
            this.loading = false;
            setTimeout(() => location.reload(), 1500);
          },

          error: () => {
            this.showError("Une erreur est survenue lors de l'envoi de la requête.");
            this.loading = false;
            setTimeout(() => location.reload(), 1500);
          }
        });
    }, 1500);
  }


  showNoShowDialog(): void {
    this.confirmationNoShowVisible = true;
  }

  sendNoShowNotification(): void {
    this.confirmationNoShowVisible = false;
    this.loading = true;

    setTimeout(() => {
      this._reservationService.signalNoShow(this.reservation.id).subscribe({
        next: () => {
          this.showSuccess("Notification de No-Show envoyée avec succès.");
          this.loading = false;
          setTimeout(() => location.reload(), 1500); // Reload after 1500ms
        },
        error: () => {
          this.showError("Une erreur est survenue lors de l'envoi de la notification.");
          this.loading = false;
          setTimeout(() => location.reload(), 1500); // Reload after 1500ms
        }
      });
    }, 1500); // Simulate loading for 1500ms
  }

  showDemandeReglementDialog(): void {
    this.confirmationReglementVisible = true;
  }

  showEnApprocheDialog(): void {
    this.confirmationEnApprocheVisible = true;
  }


  sendDemandeReglement(): void {
    this.confirmationReglementVisible = false;
    this.loading = true;

    setTimeout(() => {
      this._reservationService.demanderReglement(this.reservation.id).subscribe({
        next: () => {
          this.showSuccess("Demande de règlement envoyée avec succès.");
          this.loading = false;
          setTimeout(() => location.reload(), 1500); // Reload after 1500ms
        },
        error: (err) => {
          this.showError(err.error.error);
          this.loading = false;
          console.error(err)
/*           setTimeout(() => location.reload(), 1500); // Reload after 1500ms
 */        }
      });
    }, 1500); // Simulate loading for 1500ms
  }

  mettreEnApproche(): void {
    this.confirmationEnApprocheVisible = false;
    this.loading = true;

    setTimeout(() => {
      this._reservationService.mettreEnApproche(this.reservation.id).subscribe({
        next: () => {
          this.loading = false;
          this.getUrlValues();
        },
        error: (err) => {
          this.showError(err.error.message || "Une erreur est survenue.");
          this.loading = false;
          console.error(err);
        }
      });
    }, 1500); // Simule le chargement pendant 1500ms
  }

  getUrlValues(): void {
    this._reservationService.getAllUrls().subscribe(
      (response) => {
        const urlList = response;
        if (urlList.length > 0) {
          const urlPartenaire = urlList[0].url_partenaire || '';
          // Redirection vers la route souhaitée
          const reservationId = this.reservation.id;
          const redirectUrl = `${urlPartenaire}traitementCourse/${reservationId}/`;
          window.open(redirectUrl, '_blank');
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des URLs:', error);
        this.showError("Impossible de récupérer les informations de redirection.");
      }
    );
  }

  appliquerCommission() {
    this.compensationEnabled = false;
    this.calForm.get('commission')?.setValue(10); // Réinitialiser la commission à 10% par défaut
  }

  compenserCourse() {
    this.compensationEnabled = true;
    this.calForm.get('compensation')?.reset(); // Réinitialiser la compensation
  }

  toggleCommissionInput() {
    this.isCommissionByAmount = !this.isCommissionByAmount;
  }


  calculate() {
    const { compensation, commissionAmount, commission } = this.calForm.value;
    const coutTotalReservation = this.cout;

    let coutDeVente;
    let commissionValue = 0;

    if (this.compensationEnabled) {
      coutDeVente = coutTotalReservation + compensation;
      this.calForm.patchValue({ coutDeVente, commission: 0 }, { emitEvent: false });
    } else {
      if (this.isCommissionByAmount) {
        commissionValue = (commissionAmount / coutTotalReservation) * 100;
        commissionValue = parseFloat(commissionValue.toFixed(1));
        coutDeVente = coutTotalReservation - commissionAmount;
      } else {
        commissionValue = coutTotalReservation * (commission / 100);
        coutDeVente = coutTotalReservation - commissionValue;
      }
      this.calForm.patchValue({ coutDeVente, commission: commissionValue, compensation: 0 }, { emitEvent: false });
    }

    this.loading = true;
    setTimeout(() => {
      this._reservationService.commissionCompensationUpdate(this.reservationId, this.calForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.showSuccess("Mise à jour réussie !");
        },
        error: (err) => {
          this.loading = false;
          console.error(err)
          this.showError(`Erreur lors de la mise à jour `);
        }
      });
    }, 1500);
  }

}
