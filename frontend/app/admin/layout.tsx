"use client";
import '../globals.css';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Tableau de Bord', href: '/admin', icon: '📊' },
  { name: 'Produits', href: '/admin/produits', icon: '📦' },
  { name: 'Commandes', href: '/admin/panier', icon: '🛒' },
  { name: 'Clients', href: '/admin/clients', icon: '👥' },
  { name: 'Ventes', href: '/admin/ventes', icon: '💰' },
  { name: 'Paramètres', href: '/admin/parametres', icon: '⚙️' },
];

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Check if current route is active
  const isActive = (path: string) => {
    return pathname === path || (path !== '/admin' && pathname?.startsWith(path));
  };

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isMobile ? 'fixed z-30' : 'relative'
        } w-64 h-screen transition-transform duration-300 ease-in-out bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-y-auto`}
        aria-label="Sidebar"
      >
        <div className="p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold text-white">EJ LOGICIEL</h1>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-full hover:bg-gray-700 text-gray-400"
                aria-label="Fermer le menu"
              >
                ✕
              </button>
            )}
          </div>

          <nav className="flex-grow" aria-label="Navigation principale">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <span className="mr-3 text-xl" aria-hidden="true">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                    {isActive(item.href) && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true"></span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="pt-6 mt-6 border-t border-gray-700">
            <Link
              href="/"
              className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
            >
              <span className="mr-3" aria-hidden="true">🏠</span>
              <span className="font-medium">Retour au site</span>
            </Link>
            <div className="mt-6 px-4 py-3 text-xs text-gray-400">
              <p>© 2025 EJ Logiciel</p>
              <p>Version 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10 sticky top-0">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="ml-4 md:hidden">
                <h2 className="text-lg font-medium text-gray-700">
                  {navItems.find(item => isActive(item.href))?.name || 'Admin'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="hidden md:block">
                  <span className="text-gray-700">Admin</span>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full text-white flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <span className="font-bold">A</span>
                </div>
                <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg hidden group-hover:block z-50">
                  <div className="py-1">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profil
                    </Link>
                    <Link href="/admin/parametres" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Paramètres
                    </Link>
                    <Link href="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Déconnexion
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
