'use client';

import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { TypeCle, TypeProduit } from '@/utils/types';

interface KeysTableProps {
  keys: TypeCle[];
  products: TypeProduit[];
  handleEditItem: (key: TypeCle) => void;
  handleDeleteItem: (id?: number) => void;
  isLoading: boolean;
}

const KeysTable: React.FC<KeysTableProps> = ({
  keys,
  products,
  handleEditItem,
  handleDeleteItem,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des données...</p>
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contenu</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilité</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {keys.map(key => (
          <tr key={key.id}>
            <td className="px-6 py-4 whitespace-nowrap">{key.contenue.substring(0, 4)}****</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {products.find(p => p.id === key.produit)?.nom || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                key.disponiblite ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {key.disponiblite ? 'Disponible' : 'Non disponible'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{key.code_cle}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleEditItem(key)}
                className="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                <FiEdit className="inline"/> Modifier
              </button>
              <button
                onClick={() => handleDeleteItem(key.id)}
                className="text-red-600 hover:text-red-900"
              >
                <FiTrash2 className="inline"/> Supprimer
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default KeysTable;