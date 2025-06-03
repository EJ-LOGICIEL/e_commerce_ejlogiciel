'use client';

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {motion} from 'framer-motion';
import {FiInfo, FiShoppingCart} from 'react-icons/fi';
import Image from 'next/image';
import {
    ajouterAuPanier,
    fetchProduits,
    selectError,
    selectLoading,
    selectProduits
} from '@/features/produit/produitSlice';
import {toast} from 'react-hot-toast';
import {AppDispatch} from "@/redux/store";

export default function ProduitsPage() {
    const dispatch: AppDispatch = useDispatch();
    const produits = useSelector(selectProduits);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    useEffect(() => {
        dispatch(fetchProduits());
    }, [dispatch]);

    const handleAddToCart = (produit: any) => {
        dispatch(ajouterAuPanier(produit));
        toast.success(`${produit.nom} ajouté au panier`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#061e53]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600 text-center">
                    <FiInfo className="mx-auto h-12 w-12 mb-4"/>
                    <p className="text-xl font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto py-8">
                <h1 className="text-3xl font-bold text-[#061e53] mb-8 text-center">
                    Nos Produits
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {produits.map((produit) => (
                        <motion.div
                            key={produit.id}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.3}}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="relative h-48 bg-gray-200">
                                <Image
                                    src={produit.image}
                                    alt={produit.nom}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>

                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-[#061e53] mb-2">
                                    {produit.nom}
                                </h2>

                                <p className="text-gray-600 mb-4 text-sm h-20 overflow-hidden">
                                    {produit.description}
                                </p>

                                <div className="space-y-2 mb-4">
                                    <div className="grid grid-cols-2 text-sm items-center">
                                        <span className="text-gray-500">Prix standard:</span>
                                        <span className="font-semibold text-[#061e53] text-right">
                                            {Number(produit.prix).toLocaleString()} Ar
                                        </span>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{scale: 1.02}}
                                    whileTap={{scale: 0.98}}
                                    onClick={() => handleAddToCart(produit)}
                                    className="w-full py-3 px-4 bg-[#061e53] text-white rounded-full font-medium 
                                             flex items-center justify-center space-x-2 hover:bg-[#0c2b7a] 
                                             transition-colors duration-200 shadow-md hover:shadow-lg"
                                >
                                    <FiShoppingCart className="h-5 w-5"/>
                                    <span>Ajouter au panier</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}