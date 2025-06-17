export interface UserState {
    id: number;
    username: string;
    nom_complet: string;
    email: string;
    type: string;
    role: string;
    numero_telephone: string;
    adresse: string;
    code_utilisateur?: string;
    nif?: string;
    stats?: string;
    rcs?: string;
    actions?: TypeActions[]

}

export interface CurrentItem {
   id: number;
   action: string;
   produit: string;
   quantite: number;
   prix_total: number
}


export interface TypeProduit {
    code_produit: string;
    id: number;
    nom: string;
    description: string;
    prix: number;
    validite: string;
    image: string;
    categorie: TypeCategorie | number;
    prix_min: number;
    prix_max: number;
}

export interface TypeCategorie {
    description: string;
    id: number;
    nom: string;
}

export interface loginData {
    username: string;
    password: string;
}

export interface TypeCartItem {
    produit: TypeProduit
    quantite: number;
}

export interface TypeActions {
    type: string;
    prix: number;
    date_action: string;
    livree: boolean;
    payee: boolean;
    client: UserState | number;
    vendeur?: UserState | number;
    methode_paiement: string;
    elements: TypeCartItem[];
    code_action: string;
}

export interface ActionElementDetail {
    id: number;
    produit_id: number;
    produit_nom: string;
    quantite: number;
    prix_total: number;
    prix_unitaire: number;
}

export interface ActionHistory {
    id: number;
    type: string;
    prix: number;
    date_action: string;
    client: number;
    client_name: string;
    vendeur: number | null;
    vendeur_name: string | null;
    methode_paiement: number;
    methode_paiement_name: string;
    commentaire?: string;
    code_action: string;
    elements: number[];
    elements_details: ActionElementDetail[];
    livree: boolean;
    payee: boolean;
}


export interface TypeMethodePaiement {
    id: number
    nom: string;
    description: string;
}


export interface TypeCle {
    id: number;
    contenue: string;
    produit: number;
    disponiblite: boolean;
    code_cle: string;
}

export interface TypeElementAchatDevis {
    id: number;
    action: number;
    produit: number;
    quantite: number
    prix_total: number;
}
