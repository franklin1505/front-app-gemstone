export default interface Facture {
  id?: number;
  nom: string;
  prenoms?: string;
  email: string;
  telephone: string;
  datePriseEnCharge?: Date;
  dateRetour?: Date;
  attribut: any;
  note?: string | null;
  nombreBagage: string;
  nombrePassager: number;
  compagnieAerienne?: string | null;
  nomEntreprise?: string | null;
  numIdFiscale?: string | null;
  adresseEntreprise?: string | null;
  codePostal?: string | null;
  modePaiement: string;
  coutTransport: number;
  coutMajorer: number;
  lieuxPriseEnCharge: string;
  lieuxDestination: string;
  distance: number;
  duree: string;
  createdAt?: Date; // Si vous prévoyez d'utiliser la date de création du serveur
  typeReservation: string;
  coutTotalReservation: number;
  totalAttributCost: number;
  destinationInputs: any[]; // Champ JSON pour stocker un tableau d'adresses intermédiaires
  distanceWaypoint?: number | null; // Rendre ce champ nul
  dureeWaypoint?: string | null;
  numero_Facture?: string;
  stockageData: any;
  nbreChoix: number;
  info?:string;
  statut_Facture:boolean;
  etatDePayement?:string;
}
