"use client"
import React, { useState, useEffect } from 'react';
import api from '@/lib/apis';

interface DashboardProps {
  // You can add props as needed
}

// Sample data - replace with API calls when endpoints are available
const sampleSalesData = [
  { month: 'Jan', amount: 4200 },
  { month: 'Feb', amount: 5800 },
  { month: 'Mar', amount: 6500 },
  { month: 'Apr', amount: 5900 },
  { month: 'May', amount: 7200 },
  { month: 'Jun', amount: 9850 },
];

const sampleCustomers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', totalOrders: 5, totalSpent: '€520.00', lastOrder: '2023-06-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', totalOrders: 3, totalSpent: '€320.50', lastOrder: '2023-06-10' },
  { id: 3, name: 'Robert Johnson', email: 'robert@example.com', totalOrders: 8, totalSpent: '€980.75', lastOrder: '2023-06-18' },
  { id: 4, name: 'Emily Davis', email: 'emily@example.com', totalOrders: 2, totalSpent: '€150.25', lastOrder: '2023-05-30' },
  { id: 5, name: 'Michael Brown', email: 'michael@example.com', totalOrders: 6, totalSpent: '€720.00', lastOrder: '2023-06-12' },
];

export default function Dashboard({}: DashboardProps) {
  const [isLoading, setIsLoading] = useState(false);

  // In the future, you can use these states to store data from API
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState(sampleSalesData);
  const [customers, setCustomers] = useState(sampleCustomers);

  // Example of how to fetch data when API endpoints are available
  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     setIsLoading(true);
  //     try {
  //       const [ordersRes, salesRes, customersRes] = await Promise.all([
  //         api.get('/orders/'),
  //         api.get('/sales/'),
  //         api.get('/customers/')
  //       ]);
  //       
  //       setOrders(ordersRes.data);
  //       setSales(salesRes.data);
  //       setCustomers(customersRes.data);
  //     } catch (error) {
  //       console.error('Error fetching dashboard data:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   
  //   fetchDashboardData();
  // }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stats Cards */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
              <p className="text-3xl font-bold">120</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold">€9,850</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Products</h3>
              <p className="text-3xl font-bold">45</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Customers</h3>
              <p className="text-3xl font-bold">{customers.length}</p>
            </div>
          </div>

          {/* Sales Overview */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Sales Overview</h3>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between mb-4">
                <div>
                  <h4 className="text-lg font-medium">Monthly Sales</h4>
                  <p className="text-gray-500">Last 6 months</p>
                </div>
                <div>
                  <select className="border rounded p-1 text-sm">
                    <option>Last 6 months</option>
                    <option>Last year</option>
                    <option>All time</option>
                  </select>
                </div>
              </div>

              {/* Simple bar chart visualization */}
              <div className="h-64 flex items-end space-x-6 mt-4">
                {sales.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t" 
                      style={{ height: `${(item.amount / 10000) * 200}px` }}
                    ></div>
                    <div className="mt-2 text-sm">{item.month}</div>
                    <div className="text-xs text-gray-500">€{item.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Sample data - replace with actual data */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">#1234</td>
                    <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                    <td className="px-6 py-4 whitespace-nowrap">2023-05-30</td>
                    <td className="px-6 py-4 whitespace-nowrap">€120.00</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">#1235</td>
                    <td className="px-6 py-4 whitespace-nowrap">Jane Smith</td>
                    <td className="px-6 py-4 whitespace-nowrap">2023-05-29</td>
                    <td className="px-6 py-4 whitespace-nowrap">€85.50</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Processing
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">#1236</td>
                    <td className="px-6 py-4 whitespace-nowrap">Robert Johnson</td>
                    <td className="px-6 py-4 whitespace-nowrap">2023-05-28</td>
                    <td className="px-6 py-4 whitespace-nowrap">€210.25</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="px-6 py-3 flex justify-center">
                <button className="text-blue-500 hover:text-blue-700">View All Orders</button>
              </div>
            </div>
          </div>

          {/* Customers Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Top Customers</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.totalOrders}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.totalSpent}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.lastOrder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 flex justify-center">
                <button className="text-blue-500 hover:text-blue-700">View All Customers</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
