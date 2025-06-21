'use client';

import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { TypeCategorie } from '@/utils/types';

interface CategoriesTableProps {
  categories: TypeCategorie[];
  handleEditItem: (category: TypeCategorie) => void;
  handleDeleteItem: (id?: number) => void;
  isLoading: boolean;
}

const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
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
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {categories.map(category => (
          <tr key={category.id}>
            <td className="px-6 py-4 whitespace-nowrap">{category.nom}</td>
            <td className="px-6 py-4">{category.description}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleEditItem(category)}
                className="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                <FiEdit className="inline"/> Modifier
              </button>
              <button
                onClick={() => handleDeleteItem(category.id)}
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

export default CategoriesTable;