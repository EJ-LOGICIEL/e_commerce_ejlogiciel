"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/apis';

interface Commande {
  id: number;
  client: string;
  date_action?: string;
  prix: number;
  statut?: string;
  methode_paiement?: string;
  produits?: Array<{ nom: string; quantite: number; prix: number }>;
}

export default function OrdersPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCommande, setEditingCommande] = useState<Commande | null>(null);
  const [detailCommande, setDetailCommande] = useState<Commande | null>(null);
  const [form, setForm] = useState<Partial<Commande>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const fetchCommandes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/actions/?type=ACHAT');
      setCommandes(res.data);
    } catch {
      setError('Erreur lors du chargement des commandes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCommande) {
        await api.put(`/api/actions/${editingCommande.id}/`, form);
      } else {
        await api.post('/api/actions/', { ...form, type: 'ACHAT' });
      }
      setForm({});
      setEditingCommande(null);
      setShowForm(false);
      fetchCommandes();
    } catch {
      setError("Erreur lors de l'enregistrement de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (commande: Commande) => {
    setEditingCommande(commande);
    setForm({
      client: commande.client,
      prix: commande.prix,
      statut: commande.statut,
      methode_paiement: commande.methode_paiement
    });
    setShowForm(true);
  };

  const handleViewDetail = (commande: Commande) => {
    setDetailCommande(commande);
    setShowDetail(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette commande ?')) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/api/actions/${id}/`);
      fetchCommandes();
    } catch {
      setError("Erreur lors de la suppression de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (statut?: string) => {
    switch(statut) {
      case 'LIVRÉ': return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ANNULÉ': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-purple-800 mb-1">Gestion des Commandes</h2>
          <p className="text-gray-600">Visualisez, ajoutez, modifiez ou supprimez les commandes de vos clients.</p>
        </div>
        <button
          className="bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          onClick={() => { setShowForm(true); setEditingCommande(null); setForm({}); }}
        >
          + Nouvelle commande
        </button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-purple-100 animate-fade-in">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <input
                  type="text"
                  name="client"
                  placeholder="Nom du client"
                  value={form.client || ''}
                  onChange={handleChange}
                  className="border border-purple-200 p-2 rounded w-full focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
              <div className="w-full md:w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix Total (€)</label>
                <input
                  type="number"
                  name="prix"
                  placeholder="Prix"
                  value={form.prix || ''}
                  onChange={handleChange}
                  className="border border-purple-200 p-2 rounded w-full focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
              <div className="w-full md:w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  name="statut"
                  value={form.statut || ''}
                  onChange={handleChange}
                  className="border border-purple-200 p-2 rounded w-full focus:ring-2 focus:ring-purple-400"
                  required
                >
                  <option value="">Sélectionner un statut</option>
                  <option value="LIVRÉ">Livré</option>
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="ANNULÉ">Annulé</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de Paiement</label>
                <select
                  name="methode_paiement"
                  value={form.methode_paiement || ''}
                  onChange={handleChange}
                  className="border border-purple-200 p-2 rounded w-full focus:ring-2 focus:ring-purple-400"
                  required
                >
                  <option value="">Sélectionner une méthode</option>
                  <option value="1">Carte bancaire</option>
                  <option value="2">Virement</option>
                  <option value="3">PayPal</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow disabled:opacity-50"
                disabled={isSubmitting}
              >
                {editingCommande ? 'Modifier' : 'Ajouter'}
              </button>
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded shadow"
                onClick={() => { setShowForm(false); setEditingCommande(null); setForm({}); }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {showDetail && detailCommande && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-purple-100 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-purple-800">Détails de la commande #{detailCommande.id}</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowDetail(false)}
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Client</p>
              <p className="font-semibold">{detailCommande.client}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-semibold">{detailCommande.date_action ? new Date(detailCommande.date_action).toLocaleDateString() : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-semibold text-purple-700">{detailCommande.prix} €</p>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Produits</h4>
            {detailCommande.produits && detailCommande.produits.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="p-2">Produit</th>
                    <th className="p-2">Quantité</th>
                    <th className="p-2">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {detailCommande.produits.map((produit, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{produit.nom}</td>
                      <td className="p-2">{produit.quantite}</td>
                      <td className="p-2">{produit.prix} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">Aucun détail de produit disponible</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <span className="loader"></span>
            <span className="ml-2 text-purple-700">Chargement...</span>
          </div>
        ) : commandes.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Aucune commande pour le moment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-purple-50">
                  <th className="p-3 rounded-l-lg">Commande #</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {commandes.map((commande) => (
                  <tr key={commande.id} className="bg-white shadow-sm hover:shadow-md transition">
                    <td className="p-3 font-semibold text-purple-900">#{commande.id}</td>
                    <td className="p-3">{commande.client}</td>
                    <td className="p-3">{commande.date_action ? new Date(commande.date_action).toLocaleDateString() : '-'}</td>
                    <td className="p-3 font-bold text-purple-700">{commande.prix} €</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(commande.statut)}`}>
                        {commande.statut || 'En traitement'}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded shadow"
                        onClick={() => handleViewDetail(commande)}
                      >
                        Détails
                      </button>
                      <button
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded shadow"
                        onClick={() => handleEdit(commande)}
                        disabled={isSubmitting}
                      >
                        Modifier
                      </button>
                      <button
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded shadow"
                        onClick={() => handleDelete(commande.id)}
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
        .loader {
          border: 4px solid #e5e7eb;
          border-top: 4px solid #8b5cf6;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
