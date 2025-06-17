'use client';
import Img from 'next/image';
import Link from 'next/link';
import React, {useEffect} from 'react';
import {FiShoppingCart} from 'react-icons/fi';
import {useDispatch, useSelector} from "react-redux";
import {chargerPanier, selectPanier} from "@/features/produit/produitSlice";
import {TypeCartItem, UserState} from "@/utils/types";
import {AppDispatch} from "@/redux/store";
import {selectCurrentUser} from "@/features/user/userSlice";

function Header(): React.ReactElement {
    const dispatch: AppDispatch = useDispatch();
    const user: UserState | null = useSelector(selectCurrentUser)
    useEffect(() => {
        dispatch(chargerPanier())
    }, [dispatch])
    const navClass: string =
        'border border-transparent py-3 hover:border-b-blue-400 transition-all' +
        ' duration-100 hover:border-y-2 hover:border-t-blue-400 hover:text-blue-600';
    const panier: TypeCartItem[] = useSelector(selectPanier)
    const nombre_produits = panier.reduce((acc, item) => acc + item.quantite, 0);
    return (
        <header className="flex items-center justify-between pt-2 md:mx-auto md:max-w-7xl md:px-6">
            {/* Logo à gauche */}
            <div className="flex items-center gap-2 cursor-pointer">
                <Img
                    src="/ej.jpg"
                    alt="logo-ej-logiciel"
                    width={50}
                    height={55}
                    className="inline rounded-4xl"
                />
                <span className="font-bold">EJ Logiciel</span>
            </div>

            <nav className="absolute left-1/2 -translate-x-1/2 hidden md:block space-x-8">
                <Link href="/" className={navClass}>
                    Accueil
                </Link>
                <Link href="/produits" className={navClass}>
                    Produits
                </Link>
                <Link href={user ? '/mon-compte' : '/se-connecter'} className={navClass}>
                    Mon compte
                </Link>
                {user && user.role === 'admin' && (
                    <Link href="/admin-dashboard" className={navClass}>
                        Admin
                    </Link>
                )}
            </nav>

            {/* Panier à droite */}
            <Link
                href="/panier"
                className="relative flex items-center justify-center rounded-full border border-black p-2"
            >
                <FiShoppingCart className="text-2xl text-black"/>
                <span
                    className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
      {nombre_produits}
    </span>
            </Link>
        </header>

    );
}

export default Header;
