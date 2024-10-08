export class Entreprise {
  id?: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
  date_ajout: string;
  description: string;
  logo: File | null;
  pays_operation: string;
  ville_operation: string;
  type_entreprise?:string
  utilisateur?: number;

  constructor(
    nom: string = '',
    adresse: string = '',
    email: string = '',
    telephone: string = '',
    site_web: string = '',
    date_ajout: string = '',
    description: string = '',
    logo: File | null = null,
    pays_operation: string = '',
    ville_operation: string = ''
  ) {
    this.nom = nom;
    this.adresse = adresse;
    this.email = email;
    this.telephone = telephone;
    this.site_web = site_web;
    this.date_ajout = date_ajout;
    this.description = description;
    this.logo = logo;
    this.pays_operation = pays_operation;
    this.ville_operation = ville_operation;
  }
}
export class Vehicule {
  id?: number;
  entreprise!: Entreprise;
  typeVehicule!: string;
  marque!: string;
  modele!: string;
  annee_fabrication!: number;
  immatriculation!: string;
  capacite_passagers!: string;
  capacite_chargement!: string;
  tempsDisponibilite!: string;
  lieu_de_base!: string;
  galerie: File | null = null;
  moteur!: string;
  couleur_interieur!: string;
  couleur_exterieur!: string;
  puissance!: string;
  type_carburant!: string;
  longueur!: string;
  transmission!: string;
  supplement!: string;
}

export interface Prix {
  id?: number;
  vehicule: Vehicule;
  prixParKm: number;
  prixParDuree: number;
  fraisReservation: number;
  fraisLivraison: number;
  fraisParDefaut: number;
}

export class Chauffeur {
  id?: number;
  nom!: string;
  prenom!: string;
  entreprise!: Entreprise;
  email!: string;
  telephone!: string;
  date_embauche!: string;
  photo: File | null = null;
  adresse!: string;
  pays!: string;
  ville!: string;

}
