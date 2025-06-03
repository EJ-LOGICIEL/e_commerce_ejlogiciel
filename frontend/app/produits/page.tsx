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
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center">
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
        <div className="pt-5 px-4 lg:px-8">
            <h1 className="text-3xl font-bold text-[#061e53] mb-3 text-center">
                Nos Produits
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {produits.map((produit) => (
                    <motion.div
                        key={produit.id}
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.3}}
                        className="flex flex-col bg-white"
                    >
                        <Image
                            src={produit.image}
                            width={100}
                            height={100}
                            className="rounded-t-lg w-full"
                            objectFit="cover"
                            layout="responsive"
                            placeholder="blur"
                            blurDataURL={produit.image}
                            quality={100}
                            priority={true}
                            loading="eager"
                            alt={produit.nom}
                        />

                        <div className="mt-[-30px] p-2">
                            <h2 className="text-lg pt-2 font-semibold text-center text-[#061e53]">
                                {produit.nom}
                            </h2>
                            <p className="text-gray-600 pt-2 text-center text-sm">
                                {produit.description}
                            </p>
                            <div className="text-center pt-2 text-sm">
                                <span className="text-gray-500">Prix: </span>
                                <span className="font-semibold text-[#061e53]">
                                    {Number(produit.prix).toLocaleString()} Ar
                                </span>
                            </div>
                            <motion.button
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                onClick={() => handleAddToCart(produit)}
                                className="w-full mt-1 py-2 px-3 bg-[#061e53] text-white rounded-full font-medium
                             flex items-center justify-center space-x-1 hover:bg-[#0c2b7a]
                             transition-colors duration-200 shadow-md hover:shadow-lg text-sm"
                            >
                                <FiShoppingCart className="h-4 w-4"/>
                                <span>Ajouter au panier</span>
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}