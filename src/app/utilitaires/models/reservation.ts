// model de l'entite reservation
export interface Reservation {
  id?: number;
  adresse_arrivee: string;
  adresse_depart: string;
  chauffeur: string;
  date: string;
  email: string;
  heure: string;
  nom: string;
  nombre_passager: number;
  numero: string;
  numero_dossier: string;
  numero_vol: string;
  paiement: string;
  societe: string;
  tarif: number;
  vehicule: string;
  tarif_chauffeur?:string;
  commission?:string
}
