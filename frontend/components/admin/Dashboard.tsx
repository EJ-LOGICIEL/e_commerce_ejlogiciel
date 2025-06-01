"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/apis';
import { ACCESS_TOKEN } from '@/utils/constants';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

interface RecentSale {
  id: number;
  client: string;
  produit: string;
  prix: number;
  date: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatCard[]>([
    { title: 'Ventes Totales', value: 0, icon: '💰', color: 'bg-blue-100 text-blue-800' },
    { title: 'Clients', value: 0, icon: '👥', color: 'bg-indigo-100 text-indigo-800' },
    { title: 'Produits', value: 0, icon: '📦', color: 'bg-green-100 text-green-800' },
    { title: 'Revenu Mensuel', value: '0 €', icon: '📈', color: 'bg-yellow-100 text-yellow-800' },
  ]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Vérification de l'authentification
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      router.push('/auth');
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Statistiques
        const statsResponse = await api.get('/api/stats/');

        // Mettre à jour les statistiques
        if (statsResponse.data) {
          setStats([
            {
              title: 'Ventes Totales',
              value: statsResponse.data.total_ventes || 0,
              icon: '💰',
              color: 'bg-blue-100 text-blue-800'
            },
            {
              title: 'Clients',
              value: statsResponse.data.total_clients || 0,
              icon: '👥',
              color: 'bg-indigo-100 text-indigo-800'
            },
            {
              title: 'Produits',
              value: statsResponse.data.total_produits || 0,
              icon: '📦',
              color: 'bg-green-100 text-green-800'
            },
            {
              title: 'Revenu Mensuel',
              value: `${statsResponse.data.revenu_mensuel || 0} €`,
              icon: '📈',
              color: 'bg-yellow-100 text-yellow-800'
            },
          ]);
        }

        // Ventes récentes
        const salesResponse = await api.get('/api/actions/?limit=5');
        if (salesResponse.data) {
          // Formatage des données pour l'affichage
          const formattedSales = salesResponse.data.map((sale: any) => ({
            id: sale.id,
            client: sale.client,
            produit: sale.produit,
            prix: sale.prix,
            date: new Date(sale.date_action).toLocaleDateString(),
          }));
          setRecentSales(formattedSales);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données du tableau de bord', err);
        setError('Impossible de charger les données du tableau de bord.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Gestion des erreurs d'API
  const handleApiError = (err: any) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(ACCESS_TOKEN);
      router.push('/auth');
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-purple-800 mb-1">Tableau de Bord</h2>
        <p className="text-gray-600">Bienvenue dans votre espace d'administration EJ Logiciel</p>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="inline-block w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-purple-700">Chargement des données...</span>
        </div>
      ) : (
        <>
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Graphique des ventes */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Évolution des Ventes</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Graphique des ventes à implémenter avec une bibliothèque comme Chart.js</p>
            </div>
          </div>

          {/* Ventes récentes */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Ventes Récentes</h3>
            {recentSales.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Aucune vente récente à afficher</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="p-3 rounded-l-lg">Client</th>
                      <th className="p-3">Produit</th>
                      <th className="p-3">Prix</th>
                      <th className="p-3 rounded-r-lg">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="p-3 font-semibold text-purple-900">{sale.client}</td>
                        <td className="p-3 text-gray-700">{sale.produit}</td>
                        <td className="p-3 font-bold text-purple-700">{sale.prix} €</td>
                        <td className="p-3 text-gray-700">{sale.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
