'use client';

import React from 'react';
import { FiCheck, FiEdit, FiTrash2 } from 'react-icons/fi';
import { ActionElementDetail, ActionHistory } from '@/utils/types';

interface ActionsTableProps {
  actions: Partial<ActionHistory>[];
  handleEditItem: (action: Partial<ActionHistory>) => void;
  handleDeleteItem: (id?: number) => void;
  handleApproveAction: (id: number) => void;
  isLoading: boolean;
}

const ActionsTable: React.FC<ActionsTableProps> = ({
  actions,
  handleEditItem,
  handleDeleteItem,
  handleApproveAction,
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
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produits</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {actions.map(action => (
          <tr key={action.id}>
            <td className="px-6 py-4 whitespace-nowrap">{action.code_action}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                action.type === 'achat' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {action.type === 'achat' ? 'Achat' : 'Devis'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{action.prix} Ar</td>
            <td className="px-6 py-4 whitespace-nowrap">{action.date_action ? new Date(action.date_action).toLocaleDateString() : 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap">{action.client_name}</td>
            <td className="px-6 py-4">
              {action.elements_details ? (
                <div className="max-h-20 overflow-y-auto">
                  {action.elements_details.map((element: ActionElementDetail, index: number) => (
                    <div key={index} className="mb-1">
                      <span className="font-medium">{element.produit_nom}</span>
                      <span className="text-gray-500 ml-2">x{element.quantite}</span>
                      <span className="text-gray-500 ml-2">{element.prix_total} Ar</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">Aucun produit</span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{action.commentaire} Ar</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                action.payee ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {action.payee ? 'Payé' : 'Non payé'}
              </span>
              <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                action.livree ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {action.livree ? 'Livré' : 'Non livré'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              {action.type === 'achat' && (!action.livree || !action.payee) && action.id !== undefined && (
                <button
                  onClick={() => handleApproveAction(action.id as number)}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs mr-2"
                >
                  <FiCheck className="inline mr-1"/> Approuver
                </button>
              )}
              <button
                onClick={() => handleEditItem(action)}
                className="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                <FiEdit className="inline"/> Modifier
              </button>
              {action.id !== undefined && (
                <button
                  onClick={() => handleDeleteItem(action.id as number)}
                  className="text-red-600 hover:text-red-900"
                >
                  <FiTrash2 className="inline"/> Supprimer
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ActionsTable;
