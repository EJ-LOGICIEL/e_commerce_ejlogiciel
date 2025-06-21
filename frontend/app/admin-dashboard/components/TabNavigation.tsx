'use client';

import React from 'react';
import { FiUsers, FiTag, FiPackage, FiCreditCard, FiKey, FiShoppingCart } from 'react-icons/fi';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`${
            activeTab === 'users'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          <FiUsers className="inline mr-2" /> Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`${
            activeTab === 'categories'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          <FiTag className="inline mr-2" /> Catégories
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`${
            activeTab === 'products'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          <FiPackage className="inline mr-2" /> Produits
        </button>
        <button
          onClick={() => setActiveTab('payment-methods')}
          className={`${
            activeTab === 'payment-methods'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          <FiCreditCard className="inline mr-2" /> Méthodes de paiement
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          className={`${
            activeTab === 'keys'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          <FiKey className="inline mr-2" /> Clés
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`${
            activeTab === 'actions'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          <FiShoppingCart className="inline mr-2" /> Ventes
        </button>
      </nav>
    </div>
  );
};

export default TabNavigation;