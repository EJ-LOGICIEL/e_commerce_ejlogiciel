'use client';

import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { UserState } from '@/utils/types';

interface UsersTableProps {
  users: UserState[];
  handleEditItem: (user: UserState) => void;
  handleDeleteItem: (id?: number) => void;
  isLoading: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
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
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom d&#39;utilisateur</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom complet</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {users.map(user => (
          <tr key={user.id}>
            <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.nom_complet}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'vendeur' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleEditItem(user)}
                className="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                <FiEdit className="inline"/> Modifier
              </button>
              <button
                onClick={() => handleDeleteItem(user.id)}
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

export default UsersTable;