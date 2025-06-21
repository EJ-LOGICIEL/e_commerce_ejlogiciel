'use client';

import React from 'react';

interface SalesStatsProps {
  salesStats: {
    totalSales: number;
    totalRevenue: number;
    paidSales: number;
    unpaidSales: number;
    deliveredSales: number;
    undeliveredSales: number;
  };
}

const SalesStats: React.FC<SalesStatsProps> = ({ salesStats }) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ventes</h3>
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{salesStats.totalSales}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Chiffre d&#39;affaires</p>
            <p className="text-2xl font-bold">{salesStats.totalRevenue.toLocaleString()} Ar</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Paiements</h3>
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Payées</p>
            <p className="text-2xl font-bold text-green-600">{salesStats.paidSales}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Non payées</p>
            <p className="text-2xl font-bold text-red-600">{salesStats.unpaidSales}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Livraisons</h3>
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Livrées</p>
            <p className="text-2xl font-bold text-green-600">{salesStats.deliveredSales}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Non livrées</p>
            <p className="text-2xl font-bold text-red-600">{salesStats.undeliveredSales}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesStats;