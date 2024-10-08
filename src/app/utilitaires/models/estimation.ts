export class Majoration {
  id?:number;
  type_majoration!: string;
  date_start!: Date | null;
  date_end!: Date | null;
  etat!: string;
  taux_majoration!: string;
  weekdays!: number[] | null;
  createdAt?: Date | null;// Utilisez null au lieu d'un tableau vide
}

export interface MajorationPasser {
  id: number;
  type_majoration: string;
  date_start: Date | null;
  date_end: Date | null;
  etat: string;
  taux_majoration: number;
  annulation_datetime: Date;
  weekdays: number[] | null;
}

export interface Estimation {
  id?:number;
  distBase: number;
  distParcourt: number;
  durParcourt: string;
  distRetour: number;
  distanceWaypoint?: number | null;
  dureeWaypoint?: string | null;
  datePriseEnCharge: Date;
  dateRetour: Date | null;
  departAddress: string;
  destinationAddress: string;
  destinationInputs: any[]; // Remplacez 'any' par un type approprié si nécessaire
  createdAt: string; // Vous pouvez utiliser un type Date si vous le préférez
}

export interface TransportEstimate {
  transport_type: string;
  coutBrute: number;
  capacite_passagers: string;
  capacite_chargement: string;
  tva: number;
  cout: number;
  cout_majoration: number;
  is_majoration: boolean;
}

export interface Reserver {
  id?: number;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  datePriseEnCharge: string ; // Vous pouvez utiliser le type Date si nécessaire
  dateRetour?: Date | null; // Vous pouvez utiliser le type Date si nécessaire
  attribut: any[]; // Utilisez un type approprié pour le champ attribut (peut-être une interface)
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
  createdAt?: string; // Vous pouvez utiliser le type Date si nécessaire
  typeReservation: string;
  coutTotalReservation:number;
  totalAttributCost:number;
  chauffeur?: string;
  destinationInputs: any[]; // Remplacez par le type approprié pour votre tableau d'adresses intermédiaires
  distanceWaypoint: number | null;
  dureeWaypoint: string | null;
  tarif_chauffeur?: string;
  commission ?: string;
  email_chauffeur?: string;
  societe ?: string;
  numero_dossier?: string;
  numero_reservation?: string;
  statutReservation:string;
  info?:string
  etat?:boolean
}



export interface Devis {
  id?: number; // Si vous prévoyez d'utiliser l'ID du serveur
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
  statut_Devis: boolean;
  stockageData: any;
  nbreChoix: number;
  info?:string;
  numero_Devis?: string;
}

export interface EstimationFinal {
  id?: number; // Si l'ID est également renvoyé par votre API
  distParcourt: number;
  durParcourt: string;
  datePriseEnCharge: string; // Vous pouvez utiliser le type "Date" si nécessaire
  dateRetour: string | null;
  distanceWaypoint: number | null;
  dureeWaypoint: string | null;
  lieuxPriseEnCharge: string;
  lieuxDestination: string;
  destinationInputs: any[]; // Vous pouvez utiliser un type spécifique au lieu de "any"
  createdAt: string;
  coutTransport: number;
  coutMajorer: number;
  typeVehicule: string;
  coutTotalReservation: number;
  totalAttributCost: number;
  attribut: any[]; // Vous pouvez utiliser un type spécifique au lieu de "any"
  info?:string
}
