'use client';

import React from 'react';
import { TypeProduit, TypeCategorie } from '@/utils/types';

interface ProductFormProps {
  productForm: Partial<TypeProduit>;
  categories: TypeCategorie[];
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  modalType: 'add' | 'edit';
  onCancel: () => void;
  productImage: File | null;
}

const ProductForm: React.FC<ProductFormProps> = ({
  productForm,
  categories,
  handleFormChange,
  handleFileChange,
  handleSubmit,
  isLoading,
  modalType,
  onCancel,
  productImage
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom</label>
        <input
          type="text"
          name="nom"
          value={productForm.nom || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={productForm.description || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Catégorie</label>
        <select
          name="categorie"
          value={typeof productForm.categorie === 'object' ? productForm.categorie.id : productForm.categorie || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.nom}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Validité</label>
        <select
          name="validite"
          value={productForm.validite || '1 ans'}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="1 ans">1 ans</option>
          <option value="2 ans">2 ans</option>
          <option value="3 ans">3 ans</option>
          <option value="a vie">À vie</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Prix minimum</label>
        <input
          type="number"
          name="prix_min"
          value={productForm.prix_min || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Prix</label>
        <input
          type="number"
          name="prix"
          value={productForm.prix || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Prix maximum</label>
        <input
          type="number"
          name="prix_max"
          value={productForm.prix_max || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Image du produit</label>
        <input
          type="file"
          name="image"
          onChange={handleFileChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          accept="image/*"
          required={modalType === 'add'}
        />
        {modalType === 'edit' && productForm.image && !productImage && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Image actuelle: {productForm.image.split('/').pop()}</p>
          </div>
        )}
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

export default ProductForm;