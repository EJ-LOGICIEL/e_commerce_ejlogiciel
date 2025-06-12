export interface UserState {
    id?: number;
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


export interface TypeProduit {
    id: number;
    nom: string;
    description: string;
    prix: number;
    validite: string;
    image: string;
    categorie: Categorie | number;
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
    produit: TypeProduit | number;
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
    prix: string;
    date_action: string;
    livree: boolean;
    payee: boolean;
    client: UserState | number;
    vendeur?: UserState | number;
    methode_paiement: string;
    elements: TypeCartItem[];
    code_action: string;
}

export interface ActionHistory {
    id: number;
    type: string;
    prix: string;
    date_action: string;
    client: number;
    client_name: string;
    vendeur: number | null;
    vendeur_name: string | null;
    methode_paiement: number;
    methode_paiement_name: string;
    code_action: string;
    elements: number[];
    elements_details: {
        id: number;
        produit_id: number;
        produit_nom: string;
        quantite: number;
        prix_total: number;
        prix_unitaire: number;
    }[];
    livree: boolean;
    payee: boolean;
}


export interface TypeMethodePaiement {
    id: number
    nom: string;
    description: string;
}