"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/apis';

interface Categorie {
  id: number;
  nom: string;
  description?: string;
}

interface Produit {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  prix_min: number;
  prix_max: number;
  image: string;
  categorie: number;
  categorie_nom?: string;
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
  const [categories, setCategories] = useState<Categorie[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories/');
      setCategories(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  };

  const fetchProduits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/produits/');
      // Enrichir les produits avec le nom de la catégorie
      const produitsEnrichis = res.data.map((produit: Produit) => {
        const categorie = categories.find(c => c.id === produit.categorie);
        return {
          ...produit,
          categorie_nom: categorie ? categorie.nom : 'Catégorie inconnue'
        };
      });
      setProduits(produitsEnrichis);
      setFilteredProduits(produitsEnrichis);
    } catch (err) {
      setError('Erreur lors du chargement des produits.');
      showNotification('error', 'Erreur lors du chargement des produits.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories().then(() => fetchProduits());
  }, []);

  // Rafraîchir les produits quand les catégories changent
  useEffect(() => {
    if (categories.length > 0 && produits.length > 0) {
      const produitsEnrichis = produits.map(produit => {
        const categorie = categories.find(c => c.id === produit.categorie);
        return {
          ...produit,
          categorie_nom: categorie ? categorie.nom : 'Catégorie inconnue'
        };
      });
      setProduits(produitsEnrichis);
      setFilteredProduits(produitsEnrichis);
    }
  }, [categories]);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter produits based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProduits(produits);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = produits.filter(
        produit =>
          produit.nom.toLowerCase().includes(lowercasedSearch) ||
          (produit.description && produit.description.toLowerCase().includes(lowercasedSearch)) ||
          (produit.categorie_nom && produit.categorie_nom.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredProduits(filtered);
    }
  }, [searchTerm, produits]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === 'prix' || name === 'prix_min' || name === 'prix_max' || name === 'categorie'
        ? Number(value)
        : value
    });
  };

  // Submit form to create or update a product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProduit) {
        // Update existing product
        await api.put(`/api/produits/${editingProduit.id}/`, form);
        showNotification('success', 'Produit mis à jour avec succès');
      } else {
        // Create new product
        await api.post('/api/produits/', form);
        showNotification('success', 'Produit créé avec succès');
      }
      setShowForm(false);
      setForm({});
      setEditingProduit(null);
      fetchProduits();
    } catch (err) {
      showNotification('error', 'Erreur lors de l\'enregistrement du produit');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a product
  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      try {
        await api.delete(`/api/produits/${id}/`);
        showNotification('success', 'Produit supprimé avec succès');
        fetchProduits();
      } catch (err) {
        showNotification('error', 'Erreur lors de la suppression du produit');
      }
    }
  };

  // Edit a product
  const handleEdit = (produit: Produit) => {
    setEditingProduit(produit);
    setForm(produit);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Produits</h1>

      {/* Notification */}
      {notification && (
        <div className={`p-4 mb-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      {/* Search and Add button */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          className="p-2 border rounded w-2/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => {
            setEditingProduit(null);
            setForm({});
            setShowForm(true);
          }}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Ajouter un produit
        </button>
      </div>

      {/* Product Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">
            {editingProduit ? 'Modifier le produit' : 'Ajouter un produit'}
          </h2>

          <div className="mb-2">
            <label className="block mb-1">Nom</label>
            <input
              type="text"
              name="nom"
              value={form.nom || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">Description</label>
            <textarea
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">Catégorie</label>
            <select
              name="categorie"
              value={form.categorie || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((categorie) => (
                <option key={categorie.id} value={categorie.id}>
                  {categorie.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="block mb-1">Prix</label>
            <input
              type="number"
              name="prix"
              value={form.prix || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">Prix minimum</label>
            <input
              type="number"
              name="prix_min"
              value={form.prix_min || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">Prix maximum</label>
            <input
              type="number"
              name="prix_max"
              value={form.prix_max || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">Image (URL)</label>
            <input
              type="text"
              name="image"
              value={form.image || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-300 p-2 rounded"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* Products List */}
      {isLoading ? (
        <p className="text-center">Chargement des produits...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : filteredProduits.length === 0 ? (
        <p className="text-center">Aucun produit trouvé</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Nom</th>
                <th className="border p-2">Catégorie</th>
                <th className="border p-2">Prix min</th>
                <th className="border p-2">Prix</th>
                <th className="border p-2">Prix max</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProduits.map((produit) => (
                <tr key={produit.id}>
                  <td className="border p-2">{produit.nom}</td>
                  <td className="border p-2">{produit.categorie_nom}</td>
                  <td className="border p-2">{produit.prix_min}</td>
                  <td className="border p-2">{produit.prix}</td>
                  <td className="border p-2">{produit.prix_max}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleEdit(produit)}
                      className="bg-yellow-500 text-white p-1 rounded mr-2"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(produit.id)}
                      className="bg-red-500 text-white p-1 rounded"
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
  );
}
