"use client";
import React, { useState } from 'react';
import api from '@/lib/apis';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface ParametresApp {
  nom_boutique: string;
  email_contact: string;
  telephone_contact: string;
  adresse: string;
  tva: number;
  devise: string;
  theme_couleur: string;
  mode_maintenance: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [parametres, setParametres] = useState<ParametresApp>({
    nom_boutique: 'EJ Logiciel',
    email_contact: 'contact@ejlogiciel.fr',
    telephone_contact: '0123456789',
    adresse: '123 Avenue de la République, 75011 Paris',
    tva: 20,
    devise: 'EUR',
    theme_couleur: 'indigo',
    mode_maintenance: false
  });

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5 seconds
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setParametres(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Save settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Simulation d'une requête API - à remplacer par la vraie route API
      // await api.put('/api/parametres/', parametres);

      // Temporairement, on simule juste un délai
      await new Promise(resolve => setTimeout(resolve, 800));

      showNotification('success', 'Paramètres enregistrés avec succès');
    } catch (err) {
      showNotification('error', "Erreur lors de l'enregistrement des paramètres");
    } finally {
      setIsSaving(false);
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

      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-purple-800 mb-1">Paramètres d'Administration</h2>
        <p className="text-gray-600">Configurez les préférences et options de votre boutique logicielle.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar de navigation */}
          <div className="w-full md:w-1/4 bg-purple-50 p-4">
            <nav className="space-y-1">
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'general' 
                    ? 'bg-purple-500 text-white font-medium' 
                    : 'text-gray-700 hover:bg-purple-100'
                }`}
                onClick={() => setActiveTab('general')}
              >
                Général
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'apparence' 
                    ? 'bg-purple-500 text-white font-medium' 
                    : 'text-gray-700 hover:bg-purple-100'
                }`}
                onClick={() => setActiveTab('apparence')}
              >
                Apparence
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'facturation' 
                    ? 'bg-purple-500 text-white font-medium' 
                    : 'text-gray-700 hover:bg-purple-100'
                }`}
                onClick={() => setActiveTab('facturation')}
              >
                Facturation
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  activeTab === 'systeme' 
                    ? 'bg-purple-500 text-white font-medium' 
                    : 'text-gray-700 hover:bg-purple-100'
                }`}
                onClick={() => setActiveTab('systeme')}
              >
                Système
              </button>
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="w-full md:w-3/4 p-6">
            <form onSubmit={handleSave}>
              {/* Onglet Général */}
              {activeTab === 'general' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Informations Générales</h3>

                  <div>
                    <label htmlFor="nom_boutique" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la boutique
                    </label>
                    <input
                      type="text"
                      id="nom_boutique"
                      name="nom_boutique"
                      value={parametres.nom_boutique}
                      onChange={handleChange}
                      className="border border-purple-200 p-2 rounded w-full focus:ring-2 focus:ring-purple-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email_contact" className="block text-sm font-medium text-gray-700 mb-1">
                        Email de contact
                      </label>
                      <input
                        type="email"
                        id="email_contact"
                        name="email_contact"
                        value={parametres.email_contact}
                        onChange={handleChange}
                        className="border border-purple-200 p-2 rounded w-full focus:ring-2 focus:ring-purple-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="telephone_contact" className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone de contact
                      </label>
                      <input
                        type="text"
                        id="telephone_contact"
                        name="telephone_contact"
                        value={parametres.telephone_contact}
                        onChange={handleChange}
                        className="border border-purple-200 p-2 rounded w-full focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <textarea
                      id="adresse"
                      name="adresse"
                      value={parametres.adresse}
                      onChange={handleChange}
                      rows={3}
                      className="border border-purple-200 p-2 rounded w-full focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>
              )}

              {/* Onglet Apparence */}
              {activeTab === 'apparence' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Apparence</h3>

                  <div>
                    <label htmlFor="theme_couleur" className="block text-sm font-medium text-gray-700 mb-1">
                      Thème de couleur
                    </label>
                    <select
                      id="theme_couleur"
                      name="theme_couleur"
                      value={parametres.theme_couleur}
                      onChange={handleChange}
                      className="border border-purple-200 p-2 rounded w-full focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="indigo">Indigo</option>
                      <option value="purple">Violet</option>
                      <option value="blue">Bleu</option>
                      <option value="green">Vert</option>
                      <option value="red">Rouge</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Aperçu des couleurs</h4>
                    <div className="flex space-x-2">
                      {['indigo', 'purple', 'blue', 'green', 'red'].map((color) => (
                        <div
                          key={color}
                          className={`w-10 h-10 rounded-full cursor-pointer border-2 ${
                            parametres.theme_couleur === color 
                              ? 'border-gray-800' 
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: `var(--color-${color}-500)` }}
                          onClick={() => setParametres({...parametres, theme_couleur: color})}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Facturation */}
              {activeTab === 'facturation' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Facturation</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tva" className="block text-sm font-medium text-gray-700 mb-1">
                        Taux de TVA (%)
                      </label>
                      <input
                        type="number"
                        id="tva"
                        name="tva"
                        value={parametres.tva}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.5"
                        className="border border-purple-200 p-2 rounded w-full focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="devise" className="block text-sm font-medium text-gray-700 mb-1">
                        Devise
                      </label>
                      <select
                        id="devise"
                        name="devise"
                        value={parametres.devise}
                        onChange={handleChange}
                        className="border border-purple-200 p-2 rounded w-full focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar américain ($)</option>
                        <option value="GBP">Livre sterling (£)</option>
                        <option value="CAD">Dollar canadien (CA$)</option>
                        <option value="CHF">Franc suisse (CHF)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Information importante</h4>
                    <p className="text-sm text-yellow-700">
                      Les paramètres de facturation affectent la génération des factures et des devis.
                      Assurez-vous que ces informations sont correctes selon la réglementation en vigueur.
                    </p>
                  </div>
                </div>
              )}

              {/* Onglet Système */}
              {activeTab === 'systeme' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Paramètres Système</h3>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mode_maintenance"
                      name="mode_maintenance"
                      checked={parametres.mode_maintenance}
                      onChange={handleChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="mode_maintenance" className="ml-2 block text-sm text-gray-700">
                      Activer le mode maintenance
                    </label>
                  </div>

                  {parametres.mode_maintenance && (
                    <div className="mt-2 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700">
                        Attention : En mode maintenance, la boutique ne sera pas accessible aux utilisateurs non-administrateurs.
                      </p>
                    </div>
                  )}

                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Autres options système</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => showNotification('success', 'Cache vidé avec succès')}
                      >
                        Vider le cache
                      </button>

                      <button
                        type="button"
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={() => showNotification('success', 'Base de données optimisée')}
                      >
                        Optimiser la base de données
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons d'action (communs à tous les onglets) */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <><span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Enregistrement...</>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
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
