import '../globals.css';
import React from 'react';
import Link from 'next/link';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Products', href: '/admin/products', icon: '📦' },
  { name: 'Orders', href: '/admin/orders', icon: '🛒' },
  { name: 'Customers', href: '/admin/customers', icon: '👥' },
  { name: 'Sales', href: '/admin/sales', icon: '💰' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export default function Layout({
                                 children,
                               }: {
  children: React.ReactNode;
}) {
  return (
      <div className='flex h-screen bg-gray-100'>
        {/* Sidebar */}
        <div className='w-64 bg-gray-800 text-white'>
          <div className='p-4'>
            <h1 className='text-2xl font-bold'>Admin Panel</h1>
          </div>
          <nav className='mt-6'>
            <ul>
              {navItems.map((item) => (
                  <li key={item.name} className='mb-2'>
                    <Link href={item.href} className='flex items-center px-4 py-3 hover:bg-gray-700 rounded-lg transition-colors'>
                      <span className='mr-3'>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
              ))}
            </ul>
          </nav>
          <div className='absolute bottom-0 w-64 p-4 border-t border-gray-700'>
            <Link href="/" className='flex items-center text-gray-300 hover:text-white'>
              <span className='mr-2'>🏠</span>
              <span>Back to Site</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 overflow-y-auto'>
          <header className='bg-white shadow-sm'>
            <div className='px-6 py-4 flex justify-between items-center'>
              <h2 className='text-xl font-semibold text-gray-800'>Admin</h2>
              <div className='flex items-center'>
                <button className='p-2 rounded-full hover:bg-gray-100 mr-2'>
                  <span>🔔</span>
                </button>
                <div className='relative'>
                  <button className='flex items-center text-sm font-medium text-gray-700 hover:text-gray-900'>
                    <span className='mr-2'>Admin User</span>
                    <span className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center'>
                    👤
                  </span>
                  </button>
                </div>
              </div>
            </div>
          </header>
          <main className='p-6'>
            {children}
          </main>
        </div>
      </div>
  );
}
