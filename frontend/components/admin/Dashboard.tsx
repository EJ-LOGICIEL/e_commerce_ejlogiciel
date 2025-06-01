"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  client_nom?: string;
  produit: string;
  prix: number;
  date: string;
}

interface AdminModule {
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
  count?: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatCard[]>([
    { title: 'Ventes Totales', value: 0, icon: '💰', color: 'bg-blue-100 text-blue-800' },
    { title: 'Clients', value: 0, icon: '👥', color: 'bg-indigo-100 text-indigo-800' },
    { title: 'Produits', value: 0, icon: '📦', color: 'bg-green-100 text-green-800' },
    { title: 'Revenu Mensuel', value: '0 €', icon: '📈', color: 'bg-yellow-100 text-yellow-800' },
  ]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [modules, setModules] = useState<AdminModule[]>([
    {
      title: 'Catégories',
      description: 'Gérer les catégories de produits',
      icon: '🏷️',
      color: 'bg-purple-500',
      path: '/admin/categories',
      count: 0
    },
    {
      title: 'Produits',
      description: 'Gérer les produits du catalogue',
      icon: '📦',
      color: 'bg-green-500',
      path: '/admin/produits',
      count: 0
    },
    {
      title: 'Clients',
      description: 'Gérer les utilisateurs et clients',
      icon: '👥',
      color: 'bg-blue-500',
      path: '/admin/clients',
      count: 0
    },
    {
      title: 'Clés',
      description: 'Gérer les clés de produits',
      icon: '🔑',
      color: 'bg-yellow-500',
      path: '/admin/cles',
      count: 0
    },
    {
      title: 'Méthodes de paiement',
      description: 'Gérer les moyens de paiement',
      icon: '💳',
      color: 'bg-indigo-500',
      path: '/admin/methodes-paiement',
      count: 0
    },
    {
      title: 'Ventes',
      description: 'Gérer les achats et devis',
      icon: '💰',
      color: 'bg-teal-500',
      path: '/admin/ventes',
      count: 0
    },
    {
      title: 'Emails échoués',
      description: 'Gérer les échecs d\'envoi d\'emails',
      icon: '✉️',
      color: 'bg-red-500',
      path: '/admin/emails-echec',
      count: 0
    }
  ]);
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
        // Statistiques générales
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

          // Mettre à jour les compteurs des modules
          const updatedModules = [...modules];
          updatedModules.find(m => m.title === 'Produits')!.count = statsResponse.data.total_produits || 0;
          updatedModules.find(m => m.title === 'Clients')!.count = statsResponse.data.total_clients || 0;
          updatedModules.find(m => m.title === 'Ventes')!.count = statsResponse.data.total_ventes || 0;

          // Récupérer les compteurs pour les autres modules
          try {
            const categoriesResponse = await api.get('/api/categories/');
            updatedModules.find(m => m.title === 'Catégories')!.count = categoriesResponse.data.length;

            const clesResponse = await api.get('/api/cles/');
            updatedModules.find(m => m.title === 'Clés')!.count = clesResponse.data.length;

            const methodesResponse = await api.get('/api/methodes-paiement/');
            updatedModules.find(m => m.title === 'Méthodes de paiement')!.count = methodesResponse.data.length;

            const emailsEchecResponse = await api.get('/api/emails-echec/');
            updatedModules.find(m => m.title === 'Emails échoués')!.count = emailsEchecResponse.data.length;
          } catch (err) {
            console.error('Erreur lors de la récupération des compteurs supplémentaires', err);
          }

          setModules(updatedModules);
        }

        // Ventes récentes
        const salesResponse = await api.get('/api/actions/?limit=5');
        if (salesResponse.data) {
          // Formatage des données pour l'affichage
          const formattedSales = salesResponse.data.map((sale: any) => ({
            id: sale.id,
            client: sale.client,
            client_nom: sale.client_nom || 'Client',
            produit: sale.produit || 'Produit',
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tableau de bord administratif</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-lg text-gray-600">Chargement des données...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`p-4 ${stat.color}`}>
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">{stat.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{stat.title}</h3>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modules administratifs */}
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Modules administratifs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {modules.map((module, index) => (
              <Link href={module.path} key={index}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className={`p-4 text-white ${module.color}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl">{module.icon}</span>
                      {module.count !== undefined && (
                        <span className="bg-white text-gray-800 rounded-full px-3 py-1 text-sm font-semibold">
                          {module.count}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-bold text-xl">{module.title}</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600">{module.description}</p>
                    <div className="mt-4 flex justify-end">
                      <span className="text-sm font-semibold text-blue-500">Accéder →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Ventes récentes */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-teal-100 text-teal-800 p-4">
              <h2 className="text-xl font-bold flex items-center">
                <span className="text-2xl mr-2">🔖</span>
                Ventes récentes
              </h2>
            </div>
            <div className="p-4">
              {recentSales.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune vente récente</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sale.client_nom || 'Client'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sale.produit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sale.prix} €
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {sale.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Link href={`/admin/ventes?id=${sale.id}`}>
                              <span className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                                Détails →
                              </span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Link href="/admin/ventes">
                  <span className="inline-block bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition-colors cursor-pointer">
                    Voir toutes les ventes
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Raccourcis rapides */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-100 text-blue-800 p-4">
              <h2 className="text-xl font-bold flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                Actions rapides
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/produits">
                <div className="border border-gray-200 rounded p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center text-gray-800">
                    <span className="text-2xl mr-3">➕</span>
                    <span className="font-medium">Ajouter un produit</span>
                  </div>
                </div>
              </Link>
              <Link href="/admin/clients">
                <div className="border border-gray-200 rounded p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center text-gray-800">
                    <span className="text-2xl mr-3">👤</span>
                    <span className="font-medium">Ajouter un client</span>
                  </div>
                </div>
              </Link>
              <Link href="/admin/ventes">
                <div className="border border-gray-200 rounded p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center text-gray-800">
                    <span className="text-2xl mr-3">📋</span>
                    <span className="font-medium">Nouvelle vente</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
