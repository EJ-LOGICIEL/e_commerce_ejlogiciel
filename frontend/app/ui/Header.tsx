import Img from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';

function Header(): React.ReactElement {
  const navClass: string =
    'border border-transparent py-3 hover:border-b-blue-400 transition-all' +
    ' duration-100 hover:border-y-2 hover:border-t-blue-400 hover:text-blue-600';
  return (
    <header className='mx-auto flex max-w-[85%] items-center justify-between pt-2'>
      <h1 className='cursor-pointer'>
        <Img
          src='/ej.jpg'
          alt='logo-ej-logiciel'
          width={55}
          height={55}
          className='inline rounded-4xl'
        />
        <span className='font-bold'>EJ Logiciel</span>
      </h1>

      <nav className='hidden space-x-2 md:block'>
        <Link href='/' className={navClass}>
          Accueil
        </Link>
        <Link href='/produit' className={navClass}>
          Produits
        </Link>
        <Link href={'compte'} className={navClass}>
          Mon compte
        </Link>
      </nav>

      <Link
        href='/panier'
        className='relative flex items-center justify-center rounded-full border border-black p-2'
      >
        <FiShoppingCart className='text-2xl text-black' />
        <span className='absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white'>
          0
        </span>
      </Link>
    </header>
  );
}

export default Header;
