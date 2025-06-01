"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/apis';

interface Client {
  id: number;
  nom_complet: string;
  email: string;
}

interface Action {
  id: number;
  code_action: string;
  type: string;
}

interface EmailEchec {
  id: number;
  client: number;
  client_nom?: string;
  client_email?: string;
  action: number;
  action_code?: string;
  date_echec: string;
  erreur: string;
  donnees: string;
  resolu: boolean;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function EmailsEchecPage() {
  const [emailsEchec, setEmailsEchec] = useState<EmailEchec[]>([]);
  const [filteredEmailsEchec, setFilteredEmailsEchec] = useState<EmailEchec[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState<number | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showResolved, setShowResolved] = useState(false);

  // Données annexes
  const [clients, setClients] = useState<Client[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  // Charger les données annexes
  const fetchAnnexeData = async () => {
    try {
      // Charger les clients
      const clientsResponse = await api.get('/api/clients/');
      setClients(clientsResponse.data);

      // Charger les actions
      const actionsResponse = await api.get('/api/actions/');
      setActions(actionsResponse.data);
    } catch (err) {
      console.error('Erreur lors du chargement des données annexes:', err);
    }
  };

  const fetchEmailsEchec = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/emails-echec/');

      // Enrichir les données avec les noms des clients et codes d'action
      const emailsEnrichis = res.data.map((email: EmailEchec) => {
        const client = clients.find(c => c.id === email.client);
        const action = actions.find(a => a.id === email.action);

        return {
          ...email,
          client_nom: client ? client.nom_complet : 'Client inconnu',
          client_email: client ? client.email : 'Email inconnu',
          action_code: action ? action.code_action : 'Action inconnue'
        };
      });

      setEmailsEchec(emailsEnrichis);
      setFilteredEmailsEchec(emailsEnrichis);
    } catch (err) {
      setError('Erreur lors du chargement des échecs d\'emails.');
      showNotification('error', 'Erreur lors du chargement des échecs d\'emails.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnexeData().then(() => fetchEmailsEchec());
  }, []);

  // Rafraîchir les données quand les annexes changent
  useEffect(() => {
    if (emailsEchec.length > 0 && (clients.length > 0 || actions.length > 0)) {
      const emailsEnrichis = emailsEchec.map(email => {
        const client = clients.find(c => c.id === email.client);
        const action = actions.find(a => a.id === email.action);

        return {
          ...email,
          client_nom: client ? client.nom_complet : 'Client inconnu',
          client_email: client ? client.email : 'Email inconnu',
          action_code: action ? action.code_action : 'Action inconnue'
        };
      });

      setEmailsEchec(emailsEnrichis);
      applyFilters(emailsEnrichis);
    }
  }, [clients, actions]);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Apply all filters (search and resolved status)
  const applyFilters = (data: EmailEchec[]) => {
    let filtered = data;

    // Filter by resolved status
    if (!showResolved) {
      filtered = filtered.filter(email => !email.resolu);
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        email =>
          (email.client_nom && email.client_nom.toLowerCase().includes(lowercasedSearch)) ||
          (email.client_email && email.client_email.toLowerCase().includes(lowercasedSearch)) ||
          (email.action_code && email.action_code.toLowerCase().includes(lowercasedSearch)) ||
          email.erreur.toLowerCase().includes(lowercasedSearch)
      );
    }

    setFilteredEmailsEchec(filtered);
  };

  // Handle search term change
  useEffect(() => {
    applyFilters(emailsEchec);
  }, [searchTerm, showResolved, emailsEchec]);

  // Toggle resolved status
  const handleToggleResolved = () => {
    setShowResolved(!showResolved);
  };

  // Mark as resolved
  const handleMarkResolved = async (id: number, currentStatus: boolean) => {
    try {
      await api.patch(`/api/emails-echec/${id}/`, { resolu: !currentStatus });
      showNotification('success', `Email marqué comme ${!currentStatus ? 'résolu' : 'non résolu'}`);
      fetchEmailsEchec();
    } catch (err) {
      showNotification('error', 'Erreur lors de la mise à jour du statut');
    }
  };

  // Retry sending email
  const handleRetrySend = async (id: number) => {
    try {
      await api.post(`/api/emails-echec/${id}/retry/`);
      showNotification('success', 'Email renvoyé avec succès');
      fetchEmailsEchec();
    } catch (err) {
      showNotification('error', 'Erreur lors de la tentative de renvoi');
    }
  };

  // Delete an email failure record
  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement d\'échec d\'email?')) {
      try {
        await api.delete(`/api/emails-echec/${id}/`);
        showNotification('success', 'Enregistrement supprimé avec succès');
        fetchEmailsEchec();
      } catch (err) {
        showNotification('error', 'Erreur lors de la suppression');
      }
    }
  };

  // Toggle detail view
  const toggleDetail = (id: number) => {
    setShowDetail(showDetail === id ? null : id);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Échecs d'Emails</h1>

      {/* Notification */}
      {notification && (
        <div className={`p-4 mb-4 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-wrap gap-2 justify-between mb-4">
        <input
          type="text"
          placeholder="Rechercher par client, email ou erreur..."
          className="p-2 border rounded flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center">
          <label className="flex items-center mr-4">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={handleToggleResolved}
              className="mr-2"
            />
            Afficher les emails résolus
          </label>
          <button
            onClick={fetchEmailsEchec}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* Email Failures List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Chargement des échecs d'emails...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center p-4 bg-red-50 rounded">
          {error}
        </p>
      ) : filteredEmailsEchec.length === 0 ? (
        <p className="text-center p-8 bg-gray-50 rounded">
          Aucun échec d'email trouvé
        </p>
      ) : (
        <div className="bg-white rounded shadow">
          {filteredEmailsEchec.map((email) => (
            <div key={email.id} className="border-b last:border-b-0">
              {/* Email failure header */}
              <div
                className={`p-4 cursor-pointer flex flex-wrap justify-between items-center ${email.resolu ? 'bg-green-50' : ''}`}
                onClick={() => toggleDetail(email.id)}
              >
                <div className="flex-grow">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-2 py-1 rounded text-sm ${email.resolu ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {email.resolu ? 'Résolu' : 'Non résolu'}
                    </span>
                    <span className="font-semibold">{email.client_nom}</span>
                    <span className="text-gray-600">&lt;{email.client_email}&gt;</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-sm text-gray-600">Action: {email.action_code}</span>
                    <span className="text-sm text-gray-600 ml-4">Date: {formatDate(email.date_echec)}</span>
                  </div>
                  <div className="mt-1 text-red-600 truncate max-w-full">
                    {email.erreur}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkResolved(email.id, email.resolu);
                    }}
                    className={`px-3 py-1 rounded text-white ${email.resolu ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} transition-colors`}
                  >
                    {email.resolu ? 'Marquer non résolu' : 'Marquer résolu'}
                  </button>
                  {!email.resolu && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetrySend(email.id);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Réessayer
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(email.id);
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Email failure details */}
              {showDetail === email.id && (
                <div className="p-4 bg-gray-50 border-t">
                  <h3 className="font-semibold mb-2">Détails de l'erreur</h3>
                  <div className="mb-4">
                    <p className="text-red-600 whitespace-pre-wrap">{email.erreur}</p>
                  </div>

                  <h3 className="font-semibold mb-2">Données associées</h3>
                  <div className="bg-gray-100 p-3 rounded font-mono text-sm overflow-x-auto">
                    <pre>{email.donnees}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
