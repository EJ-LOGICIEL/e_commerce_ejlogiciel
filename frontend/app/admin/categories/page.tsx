"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/apis';

interface Categorie {
  id: number;
  nom: string;
  description: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Categorie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCategorie, setEditingCategorie] = useState<Categorie | null>(null);
  const [form, setForm] = useState<Partial<Categorie>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/categories/');
      setCategories(res.data);
      setFilteredCategories(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des catégories.');
      showNotification('error', 'Erreur lors du chargement des catégories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = categories.filter(
        categorie =>
          categorie.nom.toLowerCase().includes(lowercasedSearch) ||
          categorie.description.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  // Submit form to create or update a category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCategorie) {
        // Update existing category
        await api.put(`/api/categories/${editingCategorie.id}/`, form);
        showNotification('success', 'Catégorie mise à jour avec succès');
      } else {
        // Create new category
        await api.post('/api/categories/', form);
        showNotification('success', 'Catégorie créée avec succès');
      }
      setShowForm(false);
      setForm({});
      setEditingCategorie(null);
      fetchCategories();
    } catch (err) {
      showNotification('error', 'Erreur lors de l\'enregistrement de la catégorie');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a category
  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie? Cela supprimera également tous les produits associés.')) {
      try {
        await api.delete(`/api/categories/${id}/`);
        showNotification('success', 'Catégorie supprimée avec succès');
        fetchCategories();
      } catch (err) {
        showNotification('error', 'Erreur lors de la suppression de la catégorie');
      }
    }
  };

  // Edit a category
  const handleEdit = (categorie: Categorie) => {
    setEditingCategorie(categorie);
    setForm(categorie);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Catégories</h1>

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
          placeholder="Rechercher une catégorie..."
          className="p-2 border rounded w-2/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => {
            setEditingCategorie(null);
            setForm({});
            setShowForm(true);
          }}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Ajouter une catégorie
        </button>
      </div>

      {/* Category Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-white shadow-md">
          <h2 className="text-xl font-semibold mb-2">
            {editingCategorie ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
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
              className="w-full p-2 border rounded h-32"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-300 p-2 rounded hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Chargement des catégories...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center p-4 bg-red-50 rounded">
          {error}
        </p>
      ) : filteredCategories.length === 0 ? (
        <p className="text-center p-8 bg-gray-50 rounded">
          Aucune catégorie trouvée
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-3 px-4 text-left">Nom</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((categorie) => (
                <tr key={categorie.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{categorie.nom}</td>
                  <td className="py-3 px-4">
                    {categorie.description.length > 100
                      ? `${categorie.description.substring(0, 100)}...`
                      : categorie.description}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleEdit(categorie)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(categorie.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
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
