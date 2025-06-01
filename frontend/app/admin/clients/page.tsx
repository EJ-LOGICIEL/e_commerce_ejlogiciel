"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/apis';

interface Client {
  id: number;
  nom_complet: string;
  email: string;
  telephone?: string;
  date_joined?: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function CustomersPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch clients
  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/clients/');
      setClients(res.data);
      setFilteredClients(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des clients.");
      showNotification('error', "Erreur lors du chargement des clients.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5 seconds
  };

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = clients.filter(client =>
        client.nom_complet.toLowerCase().includes(lowercasedSearch) ||
        client.email.toLowerCase().includes(lowercasedSearch) ||
        (client.telephone && client.telephone.includes(searchTerm))
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update client
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingClient) {
        await api.put(`/api/clients/${editingClient.id}/`, form);
        showNotification('success', 'Client modifié avec succès');
      } else {
        await api.post('/api/clients/', form);
        showNotification('success', 'Client ajouté avec succès');
      }
      setForm({});
      setEditingClient(null);
      setShowForm(false);
      fetchClients();
    } catch (err) {
      setError("Erreur lors de l'enregistrement du client.");
      showNotification('error', "Erreur lors de l'enregistrement du client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit client
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setForm({ nom_complet: client.nom_complet, email: client.email, telephone: client.telephone });
    setShowForm(true);
  };

  // Delete client
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce client ?')) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/api/clients/${id}/`);
      showNotification('success', 'Client supprimé avec succès');
      fetchClients();
    } catch (err) {
      setError("Erreur lors de la suppression du client.");
      showNotification('error', "Erreur lors de la suppression du client.");
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
          <h2 className="text-3xl font-extrabold text-indigo-800 mb-1">Gestion des Clients</h2>
          <p className="text-gray-600">Visualisez, ajoutez, modifiez ou supprimez les clients de votre boutique logicielle.</p>
        </div>
        <button
          className="bg-gradient-to-r from-indigo-600 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          onClick={() => { setShowForm(true); setEditingClient(null); setForm({}); }}
        >
          + Nouveau client
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400"
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
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-indigo-100 animate-fade-in">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  name="nom_complet"
                  placeholder="Nom complet"
                  value={form.nom_complet || ''}
                  onChange={handleChange}
                  className="border border-indigo-200 p-2 rounded w-full focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email || ''}
                  onChange={handleChange}
                  className="border border-indigo-200 p-2 rounded w-full focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="text"
                  name="telephone"
                  placeholder="Téléphone"
                  value={form.telephone || ''}
                  onChange={handleChange}
                  className="border border-indigo-200 p-2 rounded w-full focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow disabled:opacity-50 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Traitement...</>
                ) : (
                  editingClient ? 'Modifier' : 'Ajouter'
                )}
              </button>
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded shadow"
                onClick={() => { setShowForm(false); setEditingClient(null); setForm({}); }}
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
            <div className="inline-block w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-indigo-700">Chargement...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            {searchTerm ? 'Aucun client ne correspond à votre recherche.' : 'Aucun client pour le moment.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-indigo-50">
                  <th className="p-3 rounded-l-lg">Nom complet</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Téléphone</th>
                  <th className="p-3">Date d'inscription</th>
                  <th className="p-3 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="bg-white shadow-sm hover:shadow-md transition">
                    <td className="p-3 font-semibold text-indigo-900">{client.nom_complet}</td>
                    <td className="p-3 text-gray-700">{client.email}</td>
                    <td className="p-3 text-gray-700">{client.telephone || '-'}</td>
                    <td className="p-3 text-gray-700">{client.date_joined ? new Date(client.date_joined).toLocaleDateString() : '-'}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded shadow"
                        onClick={() => handleEdit(client)}
                        disabled={isSubmitting}
                      >
                        Modifier
                      </button>
                      <button
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded shadow"
                        onClick={() => handleDelete(client.id)}
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
      `}</style>
    </div>
  );
}
