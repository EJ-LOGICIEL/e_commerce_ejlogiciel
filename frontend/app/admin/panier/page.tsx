"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/apis';
import { useRouter } from 'next/navigation';

interface Produit {
  id: number;
  nom: string;
  description: string;
  prix: number;
  categorie?: number;
}

interface PanierItem {
  produit: Produit;
  quantite: number;
}

export default function PanierPage() {
  const [panier, setPanier] = useState<PanierItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [methodePaiement, setMethodePaiement] = useState('CB');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Charger le panier depuis le localStorage
  useEffect(() => {
    const panierSauvegarde = localStorage.getItem('panier');
    if (panierSauvegarde) {
      setPanier(JSON.parse(panierSauvegarde));
    }
  }, []);

  // Sauvegarder le panier dans localStorage quand il change
  useEffect(() => {
    localStorage.setItem('panier', JSON.stringify(panier));
  }, [panier]);

  // Calculer le total du panier
  const calculerTotal = () => {
    return panier.reduce((total, item) => total + (item.produit.prix * item.quantite), 0);
  };

  // Mettre à jour la quantité d'un produit
  const updateQuantite = (id: number, nouvelleQuantite: number) => {
    if (nouvelleQuantite < 1) return;

    setPanier(panierActuel =>
      panierActuel.map(item =>
        item.produit.id === id
          ? { ...item, quantite: nouvelleQuantite }
          : item
      )
    );
  };

  // Supprimer un produit du panier
  const supprimerDuPanier = (id: number) => {
    setPanier(panierActuel => panierActuel.filter(item => item.produit.id !== id));
  };

  // Vider le panier
  const viderPanier = () => {
    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      setPanier([]);
    }
  };

  // Procéder à l'achat
  const procederAchat = async () => {
    if (panier.length === 0) {
      setError("Votre panier est vide");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Création des actions pour chaque produit
      const achats = panier.map(item => ({
        produit: item.produit.id,
        quantite: item.quantite,
        prix: item.produit.prix * item.quantite,
        type: 'ACHAT',
        methode_paiement: methodePaiement
      }));

      // Envoi des achats au serveur
      for (const achat of achats) {
        await api.post('/api/actions/', achat);
      }

      setSuccess("Achat effectué avec succès !");
      setPanier([]);

      setTimeout(() => {
        router.push('/admin/ventes');
      }, 2000);
    } catch (err: any) {
      console.error('Erreur lors de l\'achat', err);
      setError(err.response?.data?.detail || "Une erreur est survenue lors de l'achat");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-extrabold text-blue-800 mb-1">Votre Panier</h2>
      <p className="text-gray-600 mb-6">Gérez vos produits et finalisez votre commande</p>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded" role="alert">
          <p className="font-bold">Succès</p>
          <p>{success}</p>
        </div>
      )}

      {panier.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-lg text-center">
          <p className="text-gray-500 mb-4">Votre panier est vide</p>
          <button
            onClick={() => router.push('/accueil')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            Découvrir nos produits
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="p-3 rounded-l-lg">Produit</th>
                    <th className="p-3">Prix unitaire</th>
                    <th className="p-3">Quantité</th>
                    <th className="p-3">Sous-total</th>
                    <th className="p-3 rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {panier.map((item) => (
                    <tr key={item.produit.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-semibold text-blue-900">{item.produit.nom}</p>
                          <p className="text-sm text-gray-500">{item.produit.description}</p>
                        </div>
                      </td>
                      <td className="p-3 text-gray-700">{item.produit.prix.toFixed(2)} €</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantite(item.produit.id, item.quantite - 1)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-l"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 bg-gray-100">{item.quantite}</span>
                          <button
                            onClick={() => updateQuantite(item.produit.id, item.quantite + 1)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-r"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-blue-700">{(item.produit.prix * item.quantite).toFixed(2)} €</td>
                      <td className="p-3">
                        <button
                          onClick={() => supprimerDuPanier(item.produit.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded shadow"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="p-3 text-right font-semibold">Total</td>
                    <td className="p-3 font-extrabold text-blue-800 text-xl">{calculerTotal().toFixed(2)} €</td>
                    <td className="p-3">
                      <button
                        onClick={viderPanier}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded shadow"
                      >
                        Vider le panier
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Finaliser votre commande</h3>

            <div className="mb-4">
              <label htmlFor="methodePaiement" className="block text-sm font-medium text-gray-700 mb-1">
                Méthode de paiement
              </label>
              <select
                id="methodePaiement"
                value={methodePaiement}
                onChange={(e) => setMethodePaiement(e.target.value)}
                className="border border-blue-200 p-2 rounded w-full md:w-1/3 focus:ring-2 focus:ring-blue-400"
              >
                <option value="CB">Carte bancaire</option>
                <option value="VIREMENT">Virement bancaire</option>
                <option value="PAYPAL">PayPal</option>
                <option value="CHEQUE">Chèque</option>
              </select>
            </div>

            <button
              onClick={procederAchat}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow disabled:opacity-50 flex items-center"
            >
              {isProcessing ? (
                <>
                  <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Traitement...
                </>
              ) : (
                'Procéder à l\'achat'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
