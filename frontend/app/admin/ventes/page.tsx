"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/apis';

interface Vente {
  id: number;
  client: string;
  produit: string;
  quantite: number;
  prix: number;
  date_action?: string;
  type?: string;
  methode_paiement?: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function SalesPage() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [filteredVentes, setFilteredVentes] = useState<Vente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingVente, setEditingVente] = useState<Vente | null>(null);
  const [form, setForm] = useState<Partial<Vente>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchVentes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/actions/');
      setVentes(res.data);
      setFilteredVentes(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des ventes.');
      showNotification('error', 'Erreur lors du chargement des ventes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVentes();
  }, []);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5 seconds
  };

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredVentes(ventes);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = ventes.filter(vente =>
        vente.client.toLowerCase().includes(lowercasedSearch) ||
        vente.produit.toLowerCase().includes(lowercasedSearch) ||
        (vente.type && vente.type.toLowerCase().includes(lowercasedSearch)) ||
        (vente.methode_paiement && vente.methode_paiement.toLowerCase().includes(lowercasedSearch)) ||
        vente.prix.toString().includes(searchTerm) ||
        vente.quantite.toString().includes(searchTerm)
      );
      setFilteredVentes(filtered);
    }
  }, [searchTerm, ventes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'prix' || e.target.name === 'quantite'
      ? parseFloat(e.target.value)
      : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingVente) {
        await api.put(`/api/actions/${editingVente.id}/`, form);
        showNotification('success', 'Vente modifiée avec succès');
      } else {
        await api.post('/api/actions/', form);
        showNotification('success', 'Vente ajoutée avec succès');
      }
      setForm({});
      setEditingVente(null);
      setShowForm(false);
      fetchVentes();
    } catch (err) {
      setError("Erreur lors de l'enregistrement de la vente.");
      showNotification('error', "Erreur lors de l'enregistrement de la vente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (vente: Vente) => {
    setEditingVente(vente);
    setForm({
      client: vente.client,
      produit: vente.produit,
      quantite: vente.quantite,
      prix: vente.prix,
      type: vente.type,
      methode_paiement: vente.methode_paiement
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette vente ?')) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/api/actions/${id}/`);
      showNotification('success', 'Vente supprimée avec succès');
      fetchVentes();
    } catch (err) {
      setError("Erreur lors de la suppression de la vente.");
      showNotification('error', "Erreur lors de la suppression de la vente.");
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
          <h2 className="text-3xl font-extrabold text-green-800 mb-1">Gestion des Ventes</h2>
          <p className="text-gray-600">Visualisez, ajoutez, modifiez ou supprimez les ventes de votre boutique logicielle.</p>
        </div>
        <button
          className="bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          onClick={() => { setShowForm(true); setEditingVente(null); setForm({}); }}
        >
          + Nouvelle vente
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une vente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-400"
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
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-green-100 animate-fade-in">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <input
                  type="text"
                  name="client"
                  placeholder="Client"
                  value={form.client || ''}
                  onChange={handleChange}
                  className="border border-green-200 p-2 rounded w-full focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                <input
                  type="text"
                  name="produit"
                  placeholder="Produit"
                  value={form.produit || ''}
                  onChange={handleChange}
                  className="border border-green-200 p-2 rounded w-full focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div className="w-full md:w-1/6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input
                  type="number"
                  name="quantite"
                  placeholder="Quantité"
                  value={form.quantite || ''}
                  onChange={handleChange}
                  className="border border-green-200 p-2 rounded w-full focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div className="w-full md:w-1/6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                <input
                  type="number"
                  step="0.01"
                  name="prix"
                  placeholder="Prix"
                  value={form.prix || ''}
                  onChange={handleChange}
                  className="border border-green-200 p-2 rounded w-full focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={form.type || ''}
                  onChange={handleChange}
                  className="border border-green-200 p-2 rounded w-full focus:ring-2 focus:ring-green-400"
                  required
                >
                  <option value="">Sélectionner un type</option>
                  <option value="ACHAT">ACHAT</option>
                  <option value="DEVIS">DEVIS</option>
                </select>
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                <select
                  name="methode_paiement"
                  value={form.methode_paiement || ''}
                  onChange={handleChange}
                  className="border border-green-200 p-2 rounded w-full focus:ring-2 focus:ring-green-400"
                  required
                >
                  <option value="">Sélectionner une méthode</option>
                  <option value="CB">Carte bancaire</option>
                  <option value="VIREMENT">Virement</option>
                  <option value="ESPECES">Espèces</option>
                  <option value="CHEQUE">Chèque</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow disabled:opacity-50 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Traitement...</>
                ) : (
                  editingVente ? 'Modifier' : 'Ajouter'
                )}
              </button>
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded shadow"
                onClick={() => { setShowForm(false); setEditingVente(null); setForm({}); }}
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
            <div className="inline-block w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-green-700">Chargement...</span>
          </div>
        ) : filteredVentes.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            {searchTerm ? 'Aucune vente ne correspond à votre recherche.' : 'Aucune vente pour le moment.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-green-50">
                  <th className="p-3 rounded-l-lg">Client</th>
                  <th className="p-3">Produit</th>
                  <th className="p-3">Qté</th>
                  <th className="p-3">Prix (€)</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Paiement</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVentes.map((vente) => (
                  <tr key={vente.id} className="bg-white shadow-sm hover:shadow-md transition">
                    <td className="p-3 font-semibold text-green-900">{vente.client}</td>
                    <td className="p-3 text-gray-700">{vente.produit}</td>
                    <td className="p-3 text-gray-700">{vente.quantite}</td>
                    <td className="p-3 text-green-700 font-bold">{vente.prix} €</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vente.type === 'ACHAT' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {vente.type || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">{vente.methode_paiement || '-'}</td>
                    <td className="p-3 text-gray-700">{vente.date_action ? new Date(vente.date_action).toLocaleDateString() : '-'}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded shadow"
                        onClick={() => handleEdit(vente)}
                        disabled={isSubmitting}
                      >
                        Modifier
                      </button>
                      <button
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded shadow"
                        onClick={() => handleDelete(vente.id)}
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
