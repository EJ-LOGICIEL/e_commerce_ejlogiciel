"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/apis';

interface Client {
  id: number;
  nom_complet: string;
  email: string;
  numero_telephone: string;
  adresse: string;
  role: string;
  date_joined: string;
  password?: string; // Ajout de la propriété password optionnelle
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = clients.filter(
        client =>
          client.nom_complet.toLowerCase().includes(lowercasedSearch) ||
          client.email.toLowerCase().includes(lowercasedSearch) ||
          client.numero_telephone.includes(lowercasedSearch)
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingClient) {
        await api.put(`/api/clients/${editingClient.id}/`, form);
        showNotification('success', 'Client mis à jour avec succès');
      } else {
        await api.post('/api/clients/', form);
        showNotification('success', 'Client créé avec succès');
      }
      setShowForm(false);
      setForm({});
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      showNotification('error', 'Erreur lors de l\'enregistrement du client');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
      try {
        await api.delete(`/api/clients/${id}/`);
        showNotification('success', 'Client supprimé avec succès');
        fetchClients();
      } catch (err) {
        showNotification('error', 'Erreur lors de la suppression du client');
      }
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setForm(client);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Clients</h1>

      {notification && (
        <div className={`p-4 mb-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Rechercher un client..."
          className="p-2 border rounded w-2/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => {
            setEditingClient(null);
            setForm({});
            setShowForm(true);
          }}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Ajouter un client
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">
            {editingClient ? 'Modifier le client' : 'Ajouter un client'}
          </h2>

          <div className="mb-2">
            <label className="block mb-1">Nom complet</label>
            <input
              type="text"
              name="nom_complet"
              value={form.nom_complet || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">Numéro de téléphone</label>
            <input
              type="text"
              name="numero_telephone"
              value={form.numero_telephone || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">Adresse</label>
            <input
              type="text"
              name="adresse"
              value={form.adresse || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-2">
            <label className="block mb-1">Rôle</label>
            <select
              name="role"
              value={form.role || 'client'}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="client">Client</option>
              <option value="vendeur">Vendeur</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {!editingClient && (
            <div className="mb-2">
              <label className="block mb-1">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={form.password || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required={!editingClient}
              />
            </div>
          )}

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

      {isLoading ? (
        <p className="text-center">Chargement des clients...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : filteredClients.length === 0 ? (
        <p className="text-center">Aucun client trouvé</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Nom complet</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Téléphone</th>
                <th className="border p-2">Adresse</th>
                <th className="border p-2">Rôle</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td className="border p-2">{client.nom_complet}</td>
                  <td className="border p-2">{client.email}</td>
                  <td className="border p-2">{client.numero_telephone}</td>
                  <td className="border p-2">{client.adresse}</td>
                  <td className="border p-2">{client.role}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="bg-yellow-500 text-white p-1 rounded mr-2"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
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
