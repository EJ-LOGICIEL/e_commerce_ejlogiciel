'use client';

import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { TypeProduit, TypeCategorie } from '@/utils/types';

interface ProductsTableProps {
  products: TypeProduit[];
  categories: TypeCategorie[];
  handleEditItem: (product: TypeProduit) => void;
  handleDeleteItem: (id?: number) => void;
  isLoading: boolean;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
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
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {products.map(product => (
          <tr key={product.id}>
            <td className="px-6 py-4 whitespace-nowrap">{product.nom}</td>
            <td className="px-6 py-4 whitespace-nowrap">{product.prix} €</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {categories.find(c => c.id === product.categorie)?.nom || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{product.code_produit}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleEditItem(product)}
                className="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                <FiEdit className="inline"/> Modifier
              </button>
              <button
                onClick={() => handleDeleteItem(product.id)}
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

export default ProductsTable;