'use client';

import React from 'react';
import { FiX } from 'react-icons/fi';
import { TypeProduit } from '@/utils/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: TypeProduit[];
  productToAdd: { produit_id: number, quantite: number };
  setProductToAdd: (product: { produit_id: number, quantite: number }) => void;
  handleAddProductToAction: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  products,
  productToAdd,
  setProductToAdd,
  handleAddProductToAction
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ajouter un produit</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Produit</label>
            <select
              value={productToAdd.produit_id || ''}
              onChange={(e) => setProductToAdd({
                ...productToAdd,
                produit_id: parseInt(e.target.value)
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Sélectionner un produit</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.nom} - {product.prix} Ar
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantité</label>
            <input
              type="number"
              min="1"
              value={productToAdd.quantite}
              onChange={(e) => setProductToAdd({
                ...productToAdd,
                quantite: parseInt(e.target.value)
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleAddProductToAction}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;