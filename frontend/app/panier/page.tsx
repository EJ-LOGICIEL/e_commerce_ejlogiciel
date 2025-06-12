'use client';

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {motion} from 'framer-motion';
import {FiMinus, FiPlus, FiShoppingBag, FiTrash2} from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import {
    augmenterQuantite,
    diminuerQuantite,
    retirerDuPanier,
    selectPanier,
    viderPanier
} from '@/features/produit/produitSlice';
import toast from 'react-hot-toast';
import {AppDispatch} from "@/redux/store";
import {TypeCartItem} from "@/utils/types";

export default function PanierPage() {
    const dispatch: AppDispatch = useDispatch();
    const panier: TypeCartItem[] = useSelector(selectPanier);

    const calculerTotal = () => {
        return panier.reduce((total, item) => total + (item.produit.prix * item.quantite), 0);
    };

    const handleAugmenterQuantite = (produitId: number) => {
        dispatch(augmenterQuantite(produitId));
        toast.success('Quantité augmentée');
    };

    const handleDiminuerQuantite = (produitId: number) => {
        dispatch(diminuerQuantite(produitId));
        toast.success('Quantité diminuée');
    };

    const handleSupprimerProduit = (produitId: number) => {
        dispatch(retirerDuPanier(produitId));
        toast.success('Produit supprimé du panier');
    };

    const handleViderPanier = () => {
        dispatch(viderPanier());
        toast.success('Panier vidé');
    };

    if (panier.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <FiShoppingBag className="h-16 w-16 text-gray-400 mb-4"/>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Votre panier est vide</h2>
                <p className="text-gray-500 mb-4">Découvrez nos produits et commencez vos achats</p>
                <Link href="/produits">
                    <motion.button
                        whileHover={{scale: 1.02}}
                        whileTap={{scale: 0.98}}
                        className="bg-[#061e53] text-white px-6 py-2 rounded-full font-medium
                                hover:bg-[#0c2b7a] transition-colors duration-200"
                    >
                        Voir les produits
                    </motion.button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-[#061e53] mb-4">Mon Panier</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-2">
                    {panier.map((item) => (
                        <motion.div
                            key={item.produit.id}
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="bg-white p-2 rounded-lg shadow-sm flex items-center gap-2"
                        >
                            <Image
                                src={item.produit.image}
                                width={80}
                                height={80}
                                alt={item.produit.nom}
                                className="rounded-lg object-cover"
                            />

                            <div className="flex-grow">
                                <h3 className="font-semibold text-[#061e53]">{item.produit.nom}</h3>
                                <p className="text-sm text-gray-500">{item.produit.description}</p>
                                <p className="font-medium text-[#061e53]">
                                    {Number(item.produit.prix).toLocaleString()} Ar
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileTap={{scale: 0.95}}
                                    onClick={() => handleDiminuerQuantite(item.produit.id)}
                                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                                >
                                    <FiMinus className="h-4 w-4"/>
                                </motion.button>

                                <span className="w-8 text-center">{item.quantite}</span>

                                <motion.button
                                    whileTap={{scale: 0.95}}
                                    onClick={() => handleAugmenterQuantite(item.produit.id)}
                                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                                >
                                    <FiPlus className="h-4 w-4"/>
                                </motion.button>

                                <motion.button
                                    whileTap={{scale: 0.95}}
                                    onClick={() => handleSupprimerProduit(item.produit.id)}
                                    className="p-1 rounded-full text-red-500 hover:bg-red-50"
                                >
                                    <FiTrash2 className="h-4 w-4"/>
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="md:col-span-1">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold text-[#061e53] mb-4">Résumé</h2>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Sous-total</span>
                                <span className="font-medium">
                                    {calculerTotal().toLocaleString()} Ar
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Livraison</span>
                                <span className="font-medium">Gratuite</span>
                            </div>
                            <div className="border-t pt-2">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-semibold text-[#061e53]">
                                        {calculerTotal().toLocaleString()} Ar
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 text-center">
                            <Link href="/checkout" className={"mb-2 block"}>
                                <motion.button
                                    whileHover={{scale: 1.01}}
                                    whileTap={{scale: 0.99}}
                                    className="w-4/5 py-2 bg-gradient-to-r from-[#061e53] to-[#2563eb] text-white rounded-full
                                    font-medium
                                             hover:bg-[#0c2b7a] transition-colors duration-200"
                                >
                                    Passer la commande
                                </motion.button>
                            </Link>

                            <motion.button
                                whileHover={{scale: 1.01}}
                                whileTap={{scale: 0.99}}
                                onClick={handleViderPanier}
                                className="w-4/5  py-2 text-red-500 border border-red-500 rounded-full font-medium
                                         hover:bg-red-50 transition-colors duration-200"
                            >
                                Vider le panier
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
