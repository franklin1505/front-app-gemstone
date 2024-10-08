import { Entreprise } from "./gve";

export interface Parametres {
  id?: number;
  smtp_server?: string;
  email_host_user?: string;
  email_host_password?: string;
  createdAt?: Date
}

export interface Log {
  id?: number;
  createdAt?: string;
  message_action?: string;
}

// attribut.model.ts
export interface Attribut {
  id?: number;
  nom_attribut: string;
  prix_unitaire_attribut: number;
  nombre_maximum: number;
  createdAt?: Date;
  entreprise?:any
}

// type-vehicule.model.ts
export interface TypeVehicule {
  id?: number;
  nom_type: string;
  description?: string | null;
  createdAt?: string;
  entreprise?:any
}

// cle-api.model.ts
export interface CleAPI {
  id?: number;
  valeur_cle_api: string;
  createdAt?: string;
}

// methode-payement.model.ts
interface Methode {
  id: number;
  nom: string;
  description: string;
  is_active: boolean;
}

// configuration-de-base.model.ts
export interface ConfigurationDeBase {
  id?: number;
  titreSite1: string;
  titreSite2: string;
  texte: string;
  btnAjout: string;
  btnModifier: string;
  btnSupprimer: string;
  btnDetail: string;
  titreDoc: string;
  texteDoc: string;
  couleurDoc: string;
  createdAt?: Date;
}

export interface AutrePayement {
  id?:number;
  nom_methode: string;
  description: string;
  createdAt: Date;
}

// Stripe.ts
export class Stripe {
  id?:number;
  cle_secret!: string;
  publishable_api_key!: string;
  url_redirection!: string;
}
// PayPal.ts
export class PayPal {
  id?:number;
  cle_secret!: string;
  email!: string;
  sandbox!: boolean;
}
// VirementBancaire.ts
export class VirementBancaire {
  id?:number;
  iban!: string;
  bic!: string;
  titulaire!: string;
  libelleCompte!: string;
  description!: string | null;
}
export interface ConfigFacture {
  id?:number;
  pays_par_defaut?: string;
  devise_par_defaut?: string;
  condition_reglement_defaut?: string;
  interet_retard?: string;
  text_introductif?: string;
  pied_page_defaut?: string;
  condition_general?: string;
}

export interface ConfigDevis {
  id?:number;
  text_introductif?: string;
  pied_page_defaut?: string;
  condition_general?: string;
  interet_retard?: string;
  condition_reglement_defaut?: string;
  
}

export interface Compteur {
  id?:number;
  debut_compteur_devis: number;
  debut_compteur_facture: number;
  debut_compteuracompte: number;
}

export interface InfoUser {
  id?:number;
  email?: string;
  prenoms?: string;
  nom?: string;
  societe?: string;
  telephone?: string;
  siren_siret?: string;
  code_Naf?: string;
  numero_tva?: string;
  adresse?: string;
  adresse1?: string;
  code_Postal?: string;
  password?: string;
}

export { Entreprise, Methode };
