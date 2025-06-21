'use client';

import React from 'react';
import { UserState } from '@/utils/types';

interface UserFormProps {
  userForm: Partial<UserState>;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  modalType: 'add' | 'edit';
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  userForm,
  handleFormChange,
  handleSubmit,
  isLoading,
  modalType,
  onCancel
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom d&#39;utilisateur</label>
        <input
          type="text"
          name="username"
          value={userForm.username || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={userForm.email || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom complet</label>
        <input
          type="text"
          name="nom_complet"
          value={userForm.nom_complet || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Rôle</label>
        <select
          name="role"
          value={userForm.role || 'client'}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="client">Client</option>
          <option value="vendeur">Vendeur</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          name="type"
          value={userForm.type || 'particulier'}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="particulier">Particulier</option>
          <option value="entreprise">Entreprise</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
        <input
          type="text"
          name="numero_telephone"
          value={userForm.numero_telephone || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Adresse</label>
        <input
          type="text"
          name="adresse"
          value={userForm.adresse || ''}
          onChange={handleFormChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      {modalType === 'add' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            name="password"
            onChange={handleFormChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required={modalType === 'add'}
          />
        </div>
      )}
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

export default UserForm;