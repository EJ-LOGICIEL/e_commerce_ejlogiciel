'use client';

import React from 'react';
import { TypeCle, TypeProduit } from '@/utils/types';

interface KeyFormProps {
  keyForm: Partial<TypeCle>;
  products: TypeProduit[];
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  modalType: 'add' | 'edit';
  onCancel: () => void;
}

const KeyForm: React.FC<KeyFormProps> = ({
  keyForm,
  products,
  handleFormChange,
  handleSubmit,
  isLoading,
  modalType,
  onCancel
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Contenu</label>
        <input
          type="text"
          name="contenue"
          value={keyForm.contenue || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Produit</label>
        <select
          name="produit"
          value={keyForm.produit || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        >
          <option value="">Sélectionner un produit</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>{product.nom}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Disponibilité</label>
        <select
          name="disponiblite"
          value={keyForm.disponiblite ? 'true' : 'false'}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="true">Disponible</option>
          <option value="false">Non disponible</option>
        </select>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {isLoading ? 'Chargement...' : modalType === 'add' ? 'Ajouter' : 'Modifier'}
        </button>
      </div>
    </form>
  );
};

export default KeyForm;