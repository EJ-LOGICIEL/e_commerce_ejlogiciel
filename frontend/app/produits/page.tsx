'use client';

import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {motion} from 'framer-motion';
import {FiInfo, FiSearch, FiShoppingCart, FiTrash} from 'react-icons/fi';
import Image from 'next/image';
import {
    ajouterAuPanier,
    fetchProduits,
    retirerDuPanier,
    selectError,
    selectLoading,
    selectPanier,
    selectProduits
} from '@/features/produit/produitSlice';

import {AppDispatch} from "@/redux/store";
import {TypeCartItem, TypeProduit} from "@/utils/types";
import Loader from "@/ui/Loader";

export default function ProduitsPage() {
    const dispatch: AppDispatch = useDispatch();
    const produits: TypeProduit[] = useSelector(selectProduits);
    const loading: boolean = useSelector(selectLoading);
    const error: string | null = useSelector(selectError);
    const panier: TypeCartItem[] = useSelector(selectPanier);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedValidite, setSelectedValidite] = useState('all');

    const validiteOptions: string[] = ["1 ans", "2 ans", "3 ans", "a vie"];

    const filteredProducts: TypeProduit[] = produits
        .filter(product =>
            (selectedValidite === 'all' || product.validite === selectedValidite)
            &&
            product.nom.toLowerCase().includes(searchQuery.toLowerCase())
        );

    useEffect(() => {
        if (produits.length === 0) {
            dispatch(fetchProduits());
        }
    }, [dispatch, produits]);

    const handleAddToCart = (produit: TypeProduit) => {
        dispatch(ajouterAuPanier(produit));
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-red-600 text-center bg-red-50 p-8 rounded-xl shadow-sm max-w-md">
                    <FiInfo className="mx-auto h-12 w-12 mb-4"/>
                    <p className="text-xl font-semibold">{error}</p>
                    <button
                        onClick={() => dispatch(fetchProduits())}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-5 px-4 lg:px-8 pb-16">
            {loading && <Loader/>}

            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="text-center mb-8"
            >
                <span
                    className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
                    Catalogue
                </span>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#061e53] to-[#2563eb] text-transparent bg-clip-text mb-3">
                    Nos Produits
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Découvrez notre sélection de logiciels officiels à prix compétitifs. Tous nos produits sont
                    authentiques et activables en ligne.
                </p>
            </motion.div>

            {/* Filtres */}
            <motion.div
                className={'mb-6 flex-col md:flex-row gap-4 items-center justify-center block md:flex'}
                initial={{opacity: 0, height: 0}}
                animate={{
                    opacity: window.innerWidth >= 768 ? 1 : 0,
                    height: window.innerWidth >= 768 ? 'auto' : 0
                }}
                transition={{duration: 0.3}}
            >
                {/* Barre de recherche */}
                <div className="w-full md:w-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                    </div>
                </div>

                {/* Filtre par validité */}
                <div className="w-full md:w-auto">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <label htmlFor="validite-filter" className="font-medium text-[#061e53]">
                            Filtrer par validité:
                        </label>
                        <select
                            id="validite-filter"
                            value={selectedValidite}
                            onChange={(e) => setSelectedValidite(e.target.value)}
                            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tous</option>
                            {validiteOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Grille de produits */}
            {filteredProducts.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <p className="text-xl font-medium">Aucun produit ne correspond à votre recherche</p>
                </div>
            ) : (
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
                    xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                    {filteredProducts.map((produit: TypeProduit) => (
                        <motion.div
                            key={produit.id}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.4}}
                            className="rounded-xl shadow-sm hover:shadow-md
                            transition-all duration-300 overflow-hidden flex flex-col h-full"
                        >
                            <div className="h-48 sm:h-40 md:h-48 w-full mb-6">
                                <Image
                                    src={produit.image}
                                    width={400}
                                    height={400}
                                    className="rounded-t-lg object-cover w-full"
                                    placeholder="blur"
                                    blurDataURL={produit.image}
                                    quality={100}
                                    priority={true}
                                    loading="eager"
                                    alt={produit.nom}
                                />

                            </div>

                            <div className="p-4 flex-grow flex flex-col">
                                <h2 className="text-lg font-semibold text-[#061e53] mb-1 line-clamp-1">
                                    {produit.nom}
                                </h2>
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2 flex-grow">
                                    {produit.description}
                                </p>

                                <div className="mt-auto space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            Validité: {produit.validite}
                                        </span>
                                        <span className="font-bold text-[#061e53]">
                                            {Number(produit.prix).toLocaleString()} Ar
                                        </span>
                                    </div>

                                    {!panier.find(item => item.produit.id === produit.id) ? (
                                        <motion.button
                                            whileHover={{scale: 1.02}}
                                            whileTap={{scale: 0.98}}
                                            onClick={() => handleAddToCart(produit)}
                                            className="w-full py-2 px-3 bg-gradient-to-r from-[#061e53] to-[#2563eb] text-white rounded-lg font-medium
                                                flex items-center justify-center space-x-1 hover:from-[#0c2b7a] hover:to-[#1d4ed8]
                                                transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                                        >
                                            <FiShoppingCart className="h-4 w-4"/>
                                            <span>Ajouter au panier</span>
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileHover={{scale: 1.02}}
                                            whileTap={{scale: 0.98}}
                                            onClick={() => {
                                                dispatch(retirerDuPanier(produit.id));
                                            }}
                                            className="w-full py-2 px-3 bg-red-500 text-white rounded-lg font-medium
                                                flex items-center justify-center space-x-1 hover:bg-red-600
                                                transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                                        >
                                            <FiTrash className="h-4 w-4"/>
                                            <span>Retirer du panier</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination (pour une future implémentation) */}
            {filteredProducts.length > 0 && (
                <div className="mt-12 flex justify-center">
                    <nav className="inline-flex rounded-md shadow-sm">
                        <button
                            className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                            Précédent
                        </button>
                        <button
                            className="px-3 py-1 border-t border-b border-gray-300 bg-blue-50 text-blue-600 font-medium">
                            1
                        </button>
                        <button className="px-3 py-1 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                            2
                        </button>
                        <button
                            className="px-3 py-1 border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                            3
                        </button>
                        <button
                            className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50">
                            Suivant
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}