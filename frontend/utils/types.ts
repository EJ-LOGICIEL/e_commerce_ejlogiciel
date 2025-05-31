export interface UserState {
    id: number;
    username: string;
    nom_complet: string;
    role: string;
    numero_telephone: string;
    adresse: string;
    email: string;
    code_utilisateur: string;
    nif?: string;
    stats?: string;
    rcs?: string;
}


export interface Produit {
  id: number;
  nom: string;
  description: string;
  prix: number;
  quantite: number;
  image: string;
  categorie: Categorie;
}

export interface Categorie {
  id: number;
  nom: string;
}

export interface Cle {
  id: number;
  contenue: string;
  code_cle: string;
  validite: string;
  produit: Produit;
}

export interface loginData {
    username: string;
    password: string;
}