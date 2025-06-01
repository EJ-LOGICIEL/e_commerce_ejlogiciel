"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/apis';

interface Produit {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  categorie?: number;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function ProductsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [filteredProduits, setFilteredProduits] = useState<Produit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
  const [form, setForm] = useState<Partial<Produit>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchProduits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/produits/');
      setProduits(res.data);
      setFilteredProduits(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des produits.');
      showNotification('error', 'Erreur lors du chargement des produits.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5 seconds
  };

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProduits(produits);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = produits.filter(produit =>
        produit.nom.toLowerCase().includes(lowercasedSearch) ||
        (produit.description && produit.description.toLowerCase().includes(lowercasedSearch)) ||
        produit.prix.toString().includes(searchTerm)
      );
      setFilteredProduits(filtered);
    }
  }, [searchTerm, produits]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'prix' ? parseFloat(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProduit) {
        await api.put(`/api/produits/${editingProduit.id}/`, form);
        showNotification('success', 'Produit modifié avec succès');
      } else {
        await api.post('/api/produits/', form);
        showNotification('success', 'Produit ajouté avec succès');
      }
      setForm({});
      setEditingProduit(null);
      setShowForm(false);
      fetchProduits();
    } catch (err) {
      setError("Erreur lors de l'enregistrement du produit.");
      showNotification('error', "Erreur lors de l'enregistrement du produit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (produit: Produit) => {
    setEditingProduit(produit);
    setForm({ nom: produit.nom, description: produit.description, prix: produit.prix });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/api/produits/${id}/`);
      showNotification('success', 'Produit supprimé avec succès');
      fetchProduits();
    } catch (err) {
      setError("Erreur lors de la suppression du produit.");
      showNotification('error', "Erreur lors de la suppression du produit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-fade-in ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 
                                           'bg-red-100 text-red-800 border-l-4 border-red-500'
        }`}>
          <div className="flex items-center">
            <span className={`mr-2 ${notification.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {notification.type === 'success' ? '✓' : '✗'}
            </span>
            {notification.message}
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-blue-800 mb-1">Gestion des Produits</h2>
          <p className="text-gray-600">Visualisez, ajoutez, modifiez ou supprimez les produits de votre boutique logicielle.</p>
        </div>
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          onClick={() => { setShowForm(true); setEditingProduit(null); setForm({}); }}
        >
          + Nouveau produit
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un produit..."
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

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-blue-100 animate-fade-in">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                <input
                  type="text"
                  name="nom"
                  placeholder="Nom du produit"
                  value={form.nom || ''}
                  onChange={handleChange}
                  className="border border-blue-200 p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={form.description || ''}
                  onChange={handleChange}
                  className="border border-blue-200 p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                <input
                  type="number"
                  name="prix"
                  step="0.01"
                  placeholder="Prix (€)"
                  value={form.prix || ''}
                  onChange={handleChange}
                  className="border border-blue-200 p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow disabled:opacity-50 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Traitement...</>
                ) : (
                  editingProduit ? 'Modifier' : 'Ajouter'
                )}
              </button>
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded shadow"
                onClick={() => { setShowForm(false); setEditingProduit(null); setForm({}); }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="inline-block w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-blue-700">Chargement...</span>
          </div>
        ) : filteredProduits.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            {searchTerm ? 'Aucun produit ne correspond à votre recherche.' : 'Aucun produit pour le moment.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-blue-50">
                  <th className="p-3 rounded-l-lg">Nom</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Prix (€)</th>
                  <th className="p-3 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProduits.map((produit) => (
                  <tr key={produit.id} className="bg-white shadow-sm hover:shadow-md transition">
                    <td className="p-3 font-semibold text-blue-900">{produit.nom}</td>
                    <td className="p-3 text-gray-700">{produit.description || '-'}</td>
                    <td className="p-3 text-blue-700 font-bold">{produit.prix} €</td>
                    <td className="p-3 flex gap-2">
                      <button
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded shadow"
                        onClick={() => handleEdit(produit)}
                        disabled={isSubmitting}
                      >
                        Modifier
                      </button>
                      <button
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded shadow"
                        onClick={() => handleDelete(produit.id)}
                        disabled={isSubmitting}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
