"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/apis';

interface Client {
  id: number;
  nom_complet: string;
}

interface Produit {
  id: number;
  nom: string;
  prix: number;
  prix_min?: number;
  prix_max?: number;
  image?: string;
  description?: string;
}

interface MethodePaiement {
  id: number;
  nom: string;
}

interface ElementAchatDevis {
  id?: number;
  produit: number;
  produit_nom?: string;
  quantite: number;
  prix_total: number;
}

interface Vente {
  id: number;
  type: string;
  prix: number;
  date_action: string;
  livree: boolean;
  payee: boolean;
  client: number;
  client_nom?: string;
  vendeur?: number;
  vendeur_nom?: string;
  methode_paiement: number;
  methode_paiement_nom?: string;
  code_action?: string;
  elements: ElementAchatDevis[];
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

  // Données annexes pour les formulaires
  const [clients, setClients] = useState<Client[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [methodesPaiement, setMethodesPaiement] = useState<MethodePaiement[]>([]);
  const [elementsForm, setElementsForm] = useState<Partial<ElementAchatDevis>[]>([]);

  // Charger les données annexes
  const fetchAnnexeData = async () => {
    try {
      // Charger les clients
      const clientsResponse = await api.get('/api/clients/');
      setClients(clientsResponse.data);

      // Charger les produits
      const produitsResponse = await api.get('/api/produits/');
      setProduits(produitsResponse.data);

      // Charger les méthodes de paiement
      const methodesResponse = await api.get('/api/methodes-paiement/');
      setMethodesPaiement(methodesResponse.data);
    } catch (err) {
      console.error('Erreur lors du chargement des données annexes:', err);
      showNotification('error', 'Erreur lors du chargement des données nécessaires');
    }
  };

  const fetchVentes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/actions/');

      // Enrichir les ventes avec les noms des entités liées
      const ventesEnrichies = res.data.map((vente: Vente) => {
        const client = clients.find(c => c.id === vente.client);
        const vendeur = clients.find(c => c.id === vente.vendeur);
        const methodePaiement = methodesPaiement.find(m => m.id === vente.methode_paiement);

        // Enrichir aussi les éléments de vente
        const elementsEnrichis = vente.elements.map((element: ElementAchatDevis) => {
          const produit = produits.find(p => p.id === element.produit);
          return {
            ...element,
            produit_nom: produit ? produit.nom : 'Produit inconnu'
          };
        });

        return {
          ...vente,
          client_nom: client ? client.nom_complet : 'Client inconnu',
          vendeur_nom: vendeur ? vendeur.nom_complet : 'Aucun vendeur',
          methode_paiement_nom: methodePaiement ? methodePaiement.nom : 'Méthode inconnue',
          elements: elementsEnrichis
        };
      });

      setVentes(ventesEnrichies);
      setFilteredVentes(ventesEnrichies);
    } catch (err) {
      setError('Erreur lors du chargement des ventes.');
      showNotification('error', 'Erreur lors du chargement des ventes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnexeData().then(() => fetchVentes());
  }, []);

  // Rafraîchir les ventes quand les données annexes changent
  useEffect(() => {
    if (ventes.length > 0 && (clients.length > 0 || produits.length > 0 || methodesPaiement.length > 0)) {
      fetchVentes();
    }
  }, [clients, produits, methodesPaiement]);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter ventes based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredVentes(ventes);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = ventes.filter(
        vente =>
          (vente.client_nom && vente.client_nom.toLowerCase().includes(lowercasedSearch)) ||
          (vente.vendeur_nom && vente.vendeur_nom.toLowerCase().includes(lowercasedSearch)) ||
          (vente.code_action && vente.code_action.toLowerCase().includes(lowercasedSearch)) ||
          vente.type.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredVentes(filtered);
    }
  }, [searchTerm, ventes]);

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
        [name]: name === 'prix' || name === 'client' || name === 'vendeur' || name === 'methode_paiement'
          ? Number(value)
          : value
      });
    }
  };

  // Ajouter un élément au formulaire
  const ajouterElement = () => {
    setElementsForm([...elementsForm, { quantite: 1, prix_total: 0 }]);
  };

  // Supprimer un élément du formulaire
  const supprimerElement = (index: number) => {
    const nouveauxElements = [...elementsForm];
    nouveauxElements.splice(index, 1);
    setElementsForm(nouveauxElements);
  };

  // Gérer les changements dans les éléments
  const handleElementChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const nouveauxElements = [...elementsForm];

    if (name === 'produit') {
      const produitId = Number(value);
      const produit = produits.find(p => p.id === produitId);

      nouveauxElements[index] = {
        ...nouveauxElements[index],
        produit: produitId,
        prix_total: produit && nouveauxElements[index].quantite
          ? produit.prix * (nouveauxElements[index].quantite as number)
          : 0
      };
    } else if (name === 'quantite') {
      const quantite = Number(value);
      const produitId = nouveauxElements[index].produit as number;
      const produit = produits.find(p => p.id === produitId);

      nouveauxElements[index] = {
        ...nouveauxElements[index],
        quantite,
        prix_total: produit ? produit.prix * quantite : 0
      };
    }

    setElementsForm(nouveauxElements);

    // Calculer le prix total de la vente
    const prixTotal = nouveauxElements.reduce((sum, element) => sum + (element.prix_total || 0), 0);
    setForm({
      ...form,
      prix: prixTotal
    });
  };

  // Submit form to create or update a sale
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Préparer les données avec les éléments
    const venteData = {
      ...form,
      elements: elementsForm
    };

    try {
      if (editingVente) {
        // Update existing sale
        await api.put(`/api/actions/${editingVente.id}/`, venteData);
        showNotification('success', 'Vente mise à jour avec succès');
      } else {
        // Create new sale
        await api.post('/api/actions/', venteData);
        showNotification('success', 'Vente créée avec succès');
      }
      setShowForm(false);
      setForm({});
      setElementsForm([]);
      setEditingVente(null);
      fetchVentes();
    } catch (err) {
      showNotification('error', 'Erreur lors de l\'enregistrement de la vente');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a sale
  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente?')) {
      try {
        await api.delete(`/api/actions/${id}/`);
        showNotification('success', 'Vente supprimée avec succès');
        fetchVentes();
      } catch (err) {
        showNotification('error', 'Erreur lors de la suppression de la vente');
      }
    }
  };

  // Edit a sale
  const handleEdit = (vente: Vente) => {
    setEditingVente(vente);
    // Copier sans les noms ajoutés
    const { client_nom, vendeur_nom, methode_paiement_nom, ...venteData } = vente;
    setForm(venteData);
    setElementsForm(vente.elements.map(element => {
      // Enlever les noms de produits ajoutés
      const { produit_nom, ...elementData } = element;
      return elementData;
    }));
    setShowForm(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Ventes</h1>

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
          placeholder="Rechercher une vente..."
          className="p-2 border rounded w-2/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => {
            setEditingVente(null);
            setForm({ type: 'achat', livree: false, payee: false });
            setElementsForm([]);
            setShowForm(true);
          }}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Ajouter une vente
        </button>
      </div>

      {/* Sale Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">
            {editingVente ? 'Modifier la vente' : 'Ajouter une vente'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="mb-2">
              <label className="block mb-1">Type</label>
              <select
                name="type"
                value={form.type || 'achat'}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="achat">Achat</option>
                <option value="devis">Devis</option>
              </select>
            </div>

            <div className="mb-2">
              <label className="block mb-1">Client</label>
              <select
                name="client"
                value={form.client || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom_complet}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="block mb-1">Vendeur (optionnel)</label>
              <select
                name="vendeur"
                value={form.vendeur || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Aucun vendeur</option>
                {clients.filter(c => c.id !== form.client).map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom_complet}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="block mb-1">Méthode de paiement</label>
              <select
                name="methode_paiement"
                value={form.methode_paiement || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Sélectionner une méthode</option>
                {methodesPaiement.map((methode) => (
                  <option key={methode.id} value={methode.id}>
                    {methode.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="block mb-1">Prix total</label>
              <input
                type="number"
                name="prix"
                value={form.prix || 0}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>

            <div className="flex items-center mb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="livree"
                  checked={form.livree || false}
                  onChange={handleChange}
                  className="mr-2"
                />
                Livrée
              </label>

              <label className="flex items-center ml-4">
                <input
                  type="checkbox"
                  name="payee"
                  checked={form.payee || false}
                  onChange={handleChange}
                  className="mr-2"
                />
                Payée
              </label>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">Produits</h3>

          {elementsForm.map((element, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2 p-2 border rounded">
              <div className="md:col-span-5">
                <label className="block mb-1">Produit</label>
                <select
                  name="produit"
                  value={element.produit || ''}
                  onChange={(e) => handleElementChange(index, e)}
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

              <div className="md:col-span-3">
                <label className="block mb-1">Quantité</label>
                <input
                  type="number"
                  name="quantite"
                  value={element.quantite || 1}
                  onChange={(e) => handleElementChange(index, e)}
                  className="w-full p-2 border rounded"
                  min="1"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label className="block mb-1">Prix total</label>
                <input
                  type="number"
                  value={element.prix_total || 0}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>

              <div className="md:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={() => supprimerElement(index)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  X
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={ajouterElement}
            className="bg-green-500 text-white p-2 rounded mb-4"
          >
            Ajouter un produit
          </button>

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
              disabled={isSubmitting || elementsForm.length === 0}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* Sales List */}
      {isLoading ? (
        <p className="text-center">Chargement des ventes...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : filteredVentes.length === 0 ? (
        <p className="text-center">Aucune vente trouvée</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Code</th>
                <th className="border p-2">Type</th>
                <th className="border p-2">Client</th>
                <th className="border p-2">Vendeur</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Prix</th>
                <th className="border p-2">Paiement</th>
                <th className="border p-2">État</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVentes.map((vente) => (
                <tr key={vente.id}>
                  <td className="border p-2">{vente.code_action || '-'}</td>
                  <td className="border p-2">{vente.type === 'achat' ? 'Achat' : 'Devis'}</td>
                  <td className="border p-2">{vente.client_nom}</td>
                  <td className="border p-2">{vente.vendeur_nom || '-'}</td>
                  <td className="border p-2">{new Date(vente.date_action).toLocaleDateString()}</td>
                  <td className="border p-2">{vente.prix}</td>
                  <td className="border p-2">{vente.methode_paiement_nom}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded ${vente.payee ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {vente.payee ? 'Payée' : 'Non payée'}
                    </span>
                    <span className={`ml-1 px-2 py-1 rounded ${vente.livree ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {vente.livree ? 'Livrée' : 'Non livrée'}
                    </span>
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleEdit(vente)}
                      className="bg-yellow-500 text-white p-1 rounded mr-2"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(vente.id)}
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
