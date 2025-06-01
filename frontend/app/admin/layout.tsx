"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ACCESS_TOKEN } from '@/utils/constants';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Vérification de l'authentification
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token && !pathname?.includes('/auth')) {
      router.push('/auth');
      return;
    }

    // Récupération du nom d'utilisateur depuis localStorage
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem('userName');
    router.push('/auth');
  };

  // Navigation items with their paths and icons
  const navItems = [
    { name: 'Tableau de bord', path: '/admin', icon: '📊' },
    { name: 'Clients', path: '/admin/clients', icon: '👥' },
    { name: 'Produits', path: '/admin/produits', icon: '📦' },
    { name: 'Ventes', path: '/admin/ventes', icon: '💰' },
    { name: 'Panier', path: '/admin/panier', icon: '🛒' },
    { name: 'Paramètres', path: '/admin/parametres', icon: '⚙️' },
  ];

  // Check if the current path matches a nav item path
  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <Link href="/admin" className="flex items-center space-x-2">
                <Image src="/ej.jpg" alt="EJ Logiciel" width={40} height={40} className="rounded-md" />
                <span className="text-xl font-bold text-indigo-800">EJ Logiciel</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden rounded-md p-2 bg-indigo-50 text-indigo-800"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/accueil" className="text-gray-600 hover:text-indigo-700 px-3 py-2 rounded-md text-sm font-medium">
                Site public
              </Link>
              <Link href="/admin/panier" className="relative text-gray-600 hover:text-indigo-700 px-3 py-2 rounded-md text-sm font-medium">
                Panier
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {/* Nombre d'articles dans le panier - à implémenter */}
                  0
                </span>
              </Link>
              {userName ? (
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-700 px-3 py-2 rounded-md text-sm font-medium">
                    <span>{userName}</span>
                    <span>▼</span>
                  </button>
                  <div className="absolute right-0 w-48 py-2 mt-2 bg-white rounded-md shadow-xl z-20 hidden group-hover:block">
                    <Link href="/admin/parametres" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50">
                      Paramètres
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/auth" className="text-gray-600 hover:text-indigo-700 px-3 py-2 rounded-md text-sm font-medium">
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md z-10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <Link
              href="/accueil"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mr-2">🏠</span>
              Site public
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <span className="mr-2">🚪</span>
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar - Desktop only */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-white shadow-md">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                      isActive(item.path)
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    <span className="mr-3 text-xl">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
