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
    // Ensure dynamic operations are handled in useEffect
    const token = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN) : null;
    if (!token && !pathname?.includes('/auth')) {
      router.push('/auth');
      return;
    }

    const storedUserName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem('userName');
    }
    router.push('/auth');
  };

  const navItems = [
    { name: 'Tableau de bord', path: '/admin', icon: '📊' },
    { name: 'Clients', path: '/admin/clients', icon: '👥' },
    { name: 'Produits', path: '/admin/produits', icon: '📦' },
    { name: 'Ventes', path: '/admin/ventes', icon: '💰' },
    { name: 'Catégories', path: '/admin/categories', icon: '🏷️' },
    { name: 'Clés', path: '/admin/cles', icon: '🔑' },
    { name: 'Méthodes de paiement', path: '/admin/methodes-paiement', icon: '💳' },
    { name: 'Emails échoués', path: '/admin/emails-echec', icon: '✉️' },
    { name: 'Panier', path: '/admin/panier', icon: '🛒' },
    { name: 'Paramètres', path: '/admin/parametres', icon: '⚙️' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white h-screen flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <Image src="/ej.jpg" alt="Logo" width={40} height={40} className="rounded-full" />
          <h2 className="text-lg font-bold mt-2">Admin Panel</h2>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-4 py-2 hover:bg-gray-700 ${isActive(item.path) ? 'bg-gray-700' : ''}`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="block px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-center mt-auto"
        >
          Déconnexion
        </button>
      </aside>

      <main className="flex-1 bg-gray-100 p-4">
        {children}
      </main>
    </div>
  );
}
