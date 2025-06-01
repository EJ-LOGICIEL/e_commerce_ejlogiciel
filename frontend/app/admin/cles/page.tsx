"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/apis';

interface Produit {
  id: number;
  nom: string;
  prix: number;
}

interface Cle {
  id: number;
  contenue: string;
  produit: number;
  produit_nom?: string;
  validite: string;
  disponiblite: boolean;
  code_cle?: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function ClesPage() {
  const [cles, setCles] = useState<Cle[]>([]);
  const [filteredCles, setFilteredCles] = useState<Cle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCle, setEditingCle] = useState<Cle | null>(null);
  const [form, setForm] = useState<Partial<Cle>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [produits, setProduits] = useState<Produit[]>([]);

  // Charger les produits
  const fetchProduits = async () => {
    try {
      const res = await api.get('/api/produits/');
      setProduits(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
    }
  };

  // Charger les clés
  const fetchCles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/cles/');

      // Enrichir les clés avec les noms des produits
      const clesEnrichies = res.data.map((cle: Cle) => {
        const produit = produits.find(p => p.id === cle.produit);
        return {
          ...cle,
          produit_nom: produit ? produit.nom : 'Produit inconnu'
        };
      });

      setCles(clesEnrichies);
      setFilteredCles(clesEnrichies);
    } catch (err) {
      setError('Erreur lors du chargement des clés.');
      showNotification('error', 'Erreur lors du chargement des clés.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits().then(() => fetchCles());
  }, []);

  // Rafraîchir les clés quand les produits changent
  useEffect(() => {
    if (produits.length > 0 && cles.length > 0) {
      const clesEnrichies = cles.map(cle => {
        const produit = produits.find(p => p.id === cle.produit);
        return {
          ...cle,
          produit_nom: produit ? produit.nom : 'Produit inconnu'
        };
      });
      setCles(clesEnrichies);
      setFilteredCles(clesEnrichies);
    }
  }, [produits]);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter cles based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCles(cles);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = cles.filter(
        cle =>
          cle.contenue.toLowerCase().includes(lowercasedSearch) ||
          (cle.produit_nom && cle.produit_nom.toLowerCase().includes(lowercasedSearch)) ||
          (cle.code_cle && cle.code_cle.toLowerCase().includes(lowercasedSearch)) ||
          cle.validite.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredCles(filtered);
    }
  }, [searchTerm, cles]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setForm({
        ...form,
        [name]: target.checked
      });
    } else {
      setForm({
        ...form,
        [name]: name === 'produit' ? Number(value) : value
      });
    }
  };

  // Submit form to create or update a key
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCle) {
        // Update existing key
        await api.put(`/api/cles/${editingCle.id}/`, form);
        showNotification('success', 'Clé mise à jour avec succès');
      } else {
        // Create new key
        await api.post('/api/cles/', form);
        showNotification('success', 'Clé créée avec succès');
      }
      setShowForm(false);
      setForm({});
      setEditingCle(null);
      fetchCles();
    } catch (err) {
      showNotification('error', 'Erreur lors de l\'enregistrement de la clé');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a key
  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette clé?')) {
      try {
        await api.delete(`/api/cles/${id}/`);
        showNotification('success', 'Clé supprimée avec succès');
        fetchCles();
      } catch (err) {
        showNotification('error', 'Erreur lors de la suppression de la clé');
      }
    }
  };

  // Edit a key
  const handleEdit = (cle: Cle) => {
    setEditingCle(cle);
    // Remove added fields when editing
    const { produit_nom, ...cleData } = cle;
    setForm(cleData);
    setShowForm(true);
  };

  // Bulk import keys
  const [bulkInput, setBulkInput] = useState<string>('');
  const [showBulkForm, setShowBulkForm] = useState(false);

  const handleBulkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBulkInput(e.target.value);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.produit || !form.validite) {
      showNotification('error', 'Veuillez sélectionner un produit et une validité');
      return;
    }

    setIsSubmitting(true);
    const clesArr = bulkInput.split('\n').filter(line => line.trim() !== '');

    try {
      // For each key, create a new entry
      for (const cleContent of clesArr) {
        await api.post('/api/cles/', {
          contenue: cleContent.trim(),
          produit: form.produit,
          validite: form.validite,
          disponiblite: true
        });
      }

      showNotification('success', `${clesArr.length} clés importées avec succès`);
      setShowBulkForm(false);
      setBulkInput('');
      setForm({});
      fetchCles();
    } catch (err) {
      showNotification('error', 'Erreur lors de l\'importation des clés');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Clés de Produits</h1>

      {/* Notification */}
      {notification && (
        <div className={`p-4 mb-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      {/* Search and action buttons */}
      <div className="flex flex-wrap gap-2 justify-between mb-4">
        <input
          type="text"
          placeholder="Rechercher une clé..."
          className="p-2 border rounded flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingCle(null);
              setForm({disponiblite: true});
              setShowForm(true);
              setShowBulkForm(false);
            }}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Ajouter une clé
          </button>
          <button
            onClick={() => {
              setEditingCle(null);
              setForm({disponiblite: true});
              setShowBulkForm(true);
              setShowForm(false);
            }}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
          >
            Import en masse
          </button>
        </div>
      </div>

      {/* Single Key Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-white shadow-md">
          <h2 className="text-xl font-semibold mb-2">
            {editingCle ? 'Modifier la clé' : 'Ajouter une clé'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-2">
              <label className="block mb-1">Contenu de la clé</label>
              <input
                type="text"
                name="contenue"
                value={form.contenue || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-2">
              <label className="block mb-1">Produit</label>
              <select
                name="produit"
                value={form.produit || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Sélectionner un produit</option>
                {produits.map((produit) => (
                  <option key={produit.id} value={produit.id}>
                    {produit.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="block mb-1">Validité</label>
              <select
                name="validite"
                value={form.validite || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Sélectionner une durée</option>
                <option value="1 ans">1 an</option>
                <option value="2 ans">2 ans</option>
                <option value="3 ans">3 ans</option>
                <option value="a vie">À vie</option>
              </select>
            </div>

            <div className="mb-2 flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="disponiblite"
                  checked={form.disponiblite !== undefined ? form.disponiblite : true}
                  onChange={handleChange}
                  className="mr-2"
                />
                Disponible
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
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

      {/* Bulk Import Form */}
      {showBulkForm && (
        <form onSubmit={handleBulkSubmit} className="mb-4 p-4 border rounded bg-white shadow-md">
          <h2 className="text-xl font-semibold mb-2">
            Import en masse de clés
          </h2>

          <div className="mb-4">
            <label className="block mb-1">Produit pour toutes les clés</label>
            <select
              name="produit"
              value={form.produit || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Sélectionner un produit</option>
              {produits.map((produit) => (
                <option key={produit.id} value={produit.id}>
                  {produit.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Validité pour toutes les clés</label>
            <select
              name="validite"
              value={form.validite || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Sélectionner une durée</option>
              <option value="1 ans">1 an</option>
              <option value="2 ans">2 ans</option>
              <option value="3 ans">3 ans</option>
              <option value="a vie">À vie</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Clés (une par ligne)</label>
            <textarea
              value={bulkInput}
              onChange={handleBulkChange}
              className="w-full p-2 border rounded h-40 font-mono"
              placeholder="XXXX-XXXX-XXXX-XXXX&#10;YYYY-YYYY-YYYY-YYYY&#10;ZZZZ-ZZZZ-ZZZZ-ZZZZ"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowBulkForm(false)}
              className="bg-gray-300 p-2 rounded hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Importation en cours...' : 'Importer les clés'}
            </button>
          </div>
        </form>
      )}

      {/* Keys List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Chargement des clés...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center p-4 bg-red-50 rounded">
          {error}
        </p>
      ) : filteredCles.length === 0 ? (
        <p className="text-center p-8 bg-gray-50 rounded">
          Aucune clé trouvée
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-3 px-4 text-left">Code</th>
                <th className="py-3 px-4 text-left">Contenu</th>
                <th className="py-3 px-4 text-left">Produit</th>
                <th className="py-3 px-4 text-center">Validité</th>
                <th className="py-3 px-4 text-center">Disponibilité</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCles.map((cle) => (
                <tr key={cle.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{cle.code_cle || '-'}</td>
                  <td className="py-3 px-4 font-mono">
                    {cle.contenue}
                  </td>
                  <td className="py-3 px-4">{cle.produit_nom}</td>
                  <td className="py-3 px-4 text-center">{cle.validite}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded ${cle.disponiblite ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {cle.disponiblite ? 'Disponible' : 'Utilisée'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleEdit(cle)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(cle.id)}
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
