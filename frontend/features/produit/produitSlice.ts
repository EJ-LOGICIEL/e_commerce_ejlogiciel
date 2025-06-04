import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import axios from 'axios';
import {TypeCartItem, TypeProduit} from "@/utils/types";
import api from "@/lib/apis";


interface ProduitState {
    produits: TypeProduit[];
    panier: TypeCartItem[];
    loading: boolean;
    error: string | null;
    totalPanier: number;
}

const initialState: ProduitState = {
    produits: [],
    panier: [],
    loading: false,
    error: null,
    totalPanier: 0,
};

export const fetchProduits = createAsyncThunk(
    'produit/fetchProduits',
    async (_, {rejectWithValue}) => {
        try {
            const response = await api.get('/produits/');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data || 'Une erreur est survenue');
            }
            return rejectWithValue('Une erreur est survenue');
        }
    }
);

const produitSlice = createSlice({
    name: 'produit',
    initialState,
    reducers: {
        ajouterAuPanier: (state, action: PayloadAction<TypeProduit>) => {
            const produitExistant =
                state.panier.find(item => item.id === action.payload.id);

            if (produitExistant) {
                produitExistant.quantite += 1;
            } else {
                state.panier.push({
                    ...action.payload,
                    quantite: 1
                });
            }

            state.totalPanier = state.panier.reduce((total, item) =>
                total + (Number(item.prix) * item.quantite), 0
            );

            localStorage.setItem('panier', JSON.stringify(state.panier));
            localStorage.setItem('totalPanier', state.totalPanier.toString());
        },

        retirerDuPanier: (state, action: PayloadAction<number>) => {
            state.panier = state.panier.filter(item => item.id !== action.payload);

            state.totalPanier = state.panier.reduce((total, item) =>
                total + (Number(item.prix) * item.quantite), 0
            );

            localStorage.setItem('panier', JSON.stringify(state.panier));
            localStorage.setItem('totalPanier', state.totalPanier.toString());
        },


        augmenterQuantite: (state, action: PayloadAction<number>) => {
            const produit = state.panier.find(item => item.id === action.payload);
            if (produit) {
                produit.quantite += 1;
                state.totalPanier = state.panier.reduce((total, item) =>
                    total + (Number(item.prix) * item.quantite), 0
                );
                localStorage.setItem('panier', JSON.stringify(state.panier));
                localStorage.setItem('totalPanier', state.totalPanier.toString());
            }
        },
        diminuerQuantite: (state, action: PayloadAction<number>) => {
            const produit = state.panier.find(item => item.id === action.payload);
            if (produit && produit.quantite === 1) {
                state.panier = state.panier.filter(item => item.id !== action.payload);
            }

            if (produit && produit.quantite > 1) {
                produit.quantite -= 1;

            }


            state.totalPanier = state.panier.reduce((total, item) =>
                total + (Number(item.prix) * item.quantite), 0
            );

            localStorage.setItem('panier', JSON.stringify(state.panier));
            localStorage.setItem('totalPanier', state.totalPanier.toString());
        },


        viderPanier: (state) => {
            state.panier = [];
            state.totalPanier = 0;
            localStorage.removeItem('panier');
            localStorage.removeItem('totalPanier');
        },

        chargerPanier: (state) => {
            const panierSauvegarde: string | null = localStorage.getItem('panier');
            const totalSauvegarde: string | null = localStorage.getItem('totalPanier');

            if (panierSauvegarde) {
                state.panier = JSON.parse(panierSauvegarde);
            }

            if (totalSauvegarde) {
                state.totalPanier = Number(totalSauvegarde);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProduits.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProduits.fulfilled, (state, action: PayloadAction<TypeProduit[]>) => {
                state.loading = false;
                state.produits = action.payload;
                state.error = null;
            })
            .addCase(fetchProduits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    ajouterAuPanier,
    retirerDuPanier,
    augmenterQuantite,
    diminuerQuantite,
    viderPanier,
    chargerPanier,
} = produitSlice.actions;

export const selectProduits = (state: { produit: ProduitState }) => state.produit.produits;
export const selectPanier = (state: { produit: ProduitState }) => state.produit.panier;
export const selectTotalPanier = (state: { produit: ProduitState }) => state.produit.totalPanier;
export const selectLoading = (state: { produit: ProduitState }) => state.produit.loading;
export const selectError = (state: { produit: ProduitState }) => state.produit.error;

export default produitSlice.reducer;