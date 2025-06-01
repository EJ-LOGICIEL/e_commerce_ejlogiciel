"use client"
import React, { useState, useEffect } from 'react';
import api from '@/lib/apis';

interface DashboardProps {
  // You can add props as needed
}

interface DashboardStats {
  total_users: number;
  total_products: number;
  total_actions: number;
  recent_sales: {
    total: number;
    count: number;
  };
  top_products: Array<{
    produit__nom: string;
    total_sales: number;
  }>;
  top_clients: Array<{
    client__nom_complet: string;
    total_purchases: number;
    total_spent: number;
  }>;
}

export default function Dashboard({}: DashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeframe, setTimeframe] = useState<string>("30");

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/stats/');
      setStats(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setError("Impossible de charger les statistiques du tableau de bord");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Actualiser les données toutes les 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeframe]);

  if (isLoading && !stats) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="loader"></div>
        <span className="ml-2 text-blue-700">Chargement du tableau de bord...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-red-600 rounded-lg text-center">
        <h2 className="text-xl font-bold mb-2">Erreur</h2>
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900">Tableau de Bord</h1>
          <p className="text-gray-600">Vue d'ensemble de votre boutique logicielle</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <span className="text-gray-600 mr-2">Période:</span>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border rounded p-2 bg-white"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="365">12 derniers mois</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="ml-2 p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            title="Actualiser"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Utilisateurs</p>
              <h3 className="text-3xl font-bold text-blue-900">{stats?.total_users || 0}</h3>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-blue-500 mt-2">Clients actifs de votre boutique</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Ventes Récentes</p>
              <h3 className="text-3xl font-bold text-green-900">{stats?.recent_sales?.count || 0}</h3>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-500 mt-2">Nombre de ventes récentes</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Revenu Total</p>
              <h3 className="text-3xl font-bold text-purple-900">{stats?.recent_sales?.total || 0} €</h3>
            </div>
            <div className="bg-purple-200 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-purple-500 mt-2">Chiffre d'affaires total récent</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Produits</p>
              <h3 className="text-3xl font-bold text-amber-900">{stats?.total_products || 0}</h3>
            </div>
            <div className="bg-amber-200 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-amber-500 mt-2">Nombre de produits disponibles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Produits les plus vendus */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Produits les plus vendus</h2>
          {stats?.top_products && stats.top_products.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventes</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_products.map((product, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-3 text-sm font-medium text-gray-900">{product.produit__nom}</td>
                      <td className="py-3 px-3 text-sm text-gray-500">{product.total_sales}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>

        {/* Meilleurs clients */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Meilleurs clients</h2>
          {stats?.top_clients && stats.top_clients.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Achats</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_clients.map((client, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-3 text-sm font-medium text-gray-900">{client.client__nom_complet}</td>
                      <td className="py-3 px-3 text-sm text-gray-500">{client.total_purchases}</td>
                      <td className="py-3 px-3 text-sm text-gray-500 font-medium">{client.total_spent} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      {/* Graphique des ventes (simplifié) */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Aperçu des Ventes</h2>
          <div className="text-sm text-gray-500">Dernière période</div>
        </div>

        <div className="h-64 flex items-end space-x-2">
          {stats?.top_clients && stats.top_clients.map((client, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-blue-500 rounded-t transition-all duration-500 ease-in-out hover:bg-blue-600"
                style={{ height: `${(client.total_spent / 1000) * 180}px` }}
              ></div>
              <div className="mt-2 text-xs text-center overflow-hidden text-ellipsis w-full" title={client.client__nom_complet}>
                {client.client__nom_complet.length > 10
                  ? client.client__nom_complet.substring(0, 10) + '...'
                  : client.client__nom_complet}
              </div>
              <div className="text-xs text-gray-500">{client.total_spent} €</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .loader {
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
