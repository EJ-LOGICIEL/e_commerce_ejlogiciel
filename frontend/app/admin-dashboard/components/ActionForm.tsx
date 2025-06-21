'use client';

import React from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { ActionElementDetail, ActionHistory, TypeMethodePaiement, UserState } from '@/utils/types';

interface ActionFormProps {
  actionForm: Partial<ActionHistory>;
  actionProductsForm: ActionElementDetail[];
  users: UserState[];
  paymentMethods: TypeMethodePaiement[];
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  modalType: 'add' | 'edit';
  onCancel: () => void;
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
}

const ActionForm: React.FC<ActionFormProps> = ({
  actionForm,
  actionProductsForm,
  users,
  paymentMethods,
  handleFormChange,
  handleSubmit,
  isLoading,
  modalType,
  onCancel,
  onAddProduct,
  onRemoveProduct
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          name="type"
          value={actionForm.type || 'achat'}
          onChange={handleFormChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        >
          <option value="achat">Achat</option>
          <option value="devis">Devis</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Prix</label>
        <input
          type="number"
          name="prix"
          value={actionForm.prix || ''}
          onChange={handleFormChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Client</label>
        <select
          name="client"
          value={actionForm.client || ''}
          onChange={handleFormChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        >
          <option value="">Sélectionner un client</option>
          {users.filter(u => u.role === 'client').map(user => (
            <option key={user.id} value={user.id}>{user.nom_complet} ({user.username})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Vendeur</label>
        <select
          name="vendeur"
          value={actionForm.vendeur || ''}
          onChange={handleFormChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Sélectionner un vendeur (optionnel)</option>
          {users.filter(u => u.role === 'vendeur' || u.role === 'admin').map(user => (
            <option key={user.id} value={user.id}>{user.nom_complet} ({user.username})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Méthode de paiement</label>
        <select
          name="methode_paiement"
          value={actionForm.methode_paiement || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        >
          <option value="">Sélectionner une méthode de paiement</option>
          {paymentMethods.map(method => (
            <option key={method.id} value={method.id}>{method.nom}</option>
          ))}
        </select>
      </div>

      {/* Products section */}
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Produits</h3>
          <button
            type="button"
            onClick={onAddProduct}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="mr-1" /> Ajouter un produit
          </button>
        </div>
        <div className="mt-2 border rounded-md p-4">
          {actionProductsForm.length > 0 ? (
            <div className="space-y-4">
              {actionProductsForm.map((product, index) => (
                <div key={index} className="flex items-center space-x-4 p-2 border rounded-md">
                  <div className="flex-grow">
                    <p className="font-medium">{product.produit_nom}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500">Quantité: {product.quantite}</span>
                      <span className="text-sm text-gray-500 ml-4">Prix unitaire: {product.prix_unitaire} Ar</span>
                      <span className="text-sm text-gray-500 ml-4">Prix total: {product.prix_total} Ar</span>
                    </div>
                  </div>
                  {modalType === 'edit' && (
                    <button
                      type="button"
                      onClick={() => onRemoveProduct(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun produit ajouté</p>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="payee"
          name="payee"
          checked={actionForm.payee || false}
          onChange={handleFormChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="payee" className="ml-2 block text-sm text-gray-900">
          Payée
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="livree"
          name="livree"
          checked={actionForm.livree || false}
          onChange={handleFormChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="livree" className="ml-2 block text-sm text-gray-900">
          Livrée
        </label>
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

export default ActionForm;