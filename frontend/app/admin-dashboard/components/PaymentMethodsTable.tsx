'use client';

import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { TypeMethodePaiement } from '@/utils/types';

interface PaymentMethodsTableProps {
  paymentMethods: TypeMethodePaiement[];
  handleEditItem: (method: TypeMethodePaiement) => void;
  handleDeleteItem: (id?: number) => void;
  isLoading: boolean;
}

const PaymentMethodsTable: React.FC<PaymentMethodsTableProps> = ({
  paymentMethods,
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
        {paymentMethods.map(method => (
          <tr key={method.id}>
            <td className="px-6 py-4 whitespace-nowrap">{method.nom}</td>
            <td className="px-6 py-4">{method.description}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleEditItem(method)}
                className="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                <FiEdit className="inline"/> Modifier
              </button>
              <button
                onClick={() => handleDeleteItem(method.id)}
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

export default PaymentMethodsTable;