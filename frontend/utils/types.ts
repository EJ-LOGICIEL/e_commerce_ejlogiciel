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

}


export interface TypeProduit {
    id: number;
    nom: string;
    description: string;
    prix: number;
    quantite: number;
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

export interface TypeCartItem extends TypeProduit {
    quantite: number;
}
