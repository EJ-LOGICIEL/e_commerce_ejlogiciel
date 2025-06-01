"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/apis';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

export default function HomePage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [filteredProduits, setFilteredProduits] = useState<Produit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [panier, setPanier] = useState<PanierItem[]>([]);
  const router = useRouter();

  // Charger les produits depuis l'API
  useEffect(() => {
    const fetchProduits = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/api/produits/');
        setProduits(response.data);
        setFilteredProduits(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des produits', err);
        setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduits();
  }, []);

  // Charger le panier depuis localStorage
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

  // Filtrer les produits selon le terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProduits(produits);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = produits.filter(
        produit =>
          produit.nom.toLowerCase().includes(lowercasedSearch) ||
          produit.description.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredProduits(filtered);
    }
  }, [searchTerm, produits]);

  // Ajouter un produit au panier
  const ajouterAuPanier = (produit: Produit) => {
    setPanier(panierActuel => {
      // Vérifier si le produit est déjà dans le panier
      const produitExistant = panierActuel.find(item => item.produit.id === produit.id);

      if (produitExistant) {
        // Incrémenter la quantité si le produit existe déjà
        return panierActuel.map(item =>
          item.produit.id === produit.id
            ? { ...item, quantite: item.quantite + 1 }
            : item
        );
      } else {
        // Ajouter le nouveau produit avec quantité 1
        return [...panierActuel, { produit, quantite: 1 }];
      }
    });

    showNotification('Produit ajouté au panier', 'success');
  };

  // Afficher une notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculer le nombre total d'articles dans le panier
  const calculerTotalArticles = () => {
    return panier.reduce((total, item) => total + item.quantite, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-fade-in ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800 border-l-4 border-green-500'
              : 'bg-red-100 text-red-800 border-l-4 border-red-500'
          }`}
        >
          <div className="flex items-center">
            <span className={`mr-2 ${notification.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {notification.type === 'success' ? '✓' : '✗'}
            </span>
            {notification.message}
            <button onClick={() => setNotification(null)} className="ml-4 text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">EJ Logiciel</h1>
              <p className="text-xl md:text-2xl mb-6">Découvrez notre sélection de logiciels professionnels de qualité.</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/auth')}
                  className="bg-white text-indigo-600 hover:bg-gray-100 px-6 py-2 rounded-lg shadow-md font-semibold transition"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => {
                    const productsSection = document.getElementById('products');
                    productsSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-transparent hover:bg-indigo-500 border-2 border-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  Voir les produits
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <Image
                src="/produits/home-product.jpeg"
                alt="Logiciel EJ"
                width={500}
                height={300}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Panier flottant */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={() => router.push('/admin/panier')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {calculerTotalArticles() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {calculerTotalArticles()}
            </span>
          )}
        </button>
      </div>

      {/* Section Produits */}
      <div id="products" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-1">Nos Logiciels</h2>
        <p className="text-gray-600 mb-6">Découvrez notre sélection de logiciels professionnels</p>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un logiciel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Affichage des produits */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="inline-block w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-blue-700">Chargement des produits...</span>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
          </div>
        ) : filteredProduits.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            {searchTerm ? 'Aucun produit ne correspond à votre recherche.' : 'Aucun produit disponible pour le moment.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProduits.map((produit) => (
              <div key={produit.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <Image
                    src="/produits/home-product.jpeg"
                    alt={produit.nom}
                    width={250}
                    height={150}
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">{produit.nom}</h3>
                  <p className="text-gray-600 mb-4 h-20 overflow-hidden">{produit.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-bold text-xl">{produit.prix.toFixed(2)} €</span>
                    <button
                      onClick={() => ajouterAuPanier(produit)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
                    >
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Contact */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8">Contactez-nous</h2>
          <div className="bg-white rounded-xl shadow-md p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    className="border border-blue-200 p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="border border-blue-200 p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                    placeholder="Votre email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="border border-blue-200 p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                  placeholder="Votre message"
                ></textarea>
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow font-semibold transition"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
