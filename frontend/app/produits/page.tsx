'use client';

import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {motion} from 'framer-motion';
import {FiChevronLeft, FiChevronRight, FiInfo, FiSearch, FiShoppingCart, FiTrash} from 'react-icons/fi';
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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 8; // Number of products per page

    const validiteOptions: string[] = ["1 ans", "2 ans", "3 ans", "a vie"];

    // Filter products based on search and validity
    const filteredProducts: TypeProduit[] = produits
        .filter(product =>
            (selectedValidite === 'all' || product.validite === selectedValidite)
            &&
            product.nom.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Calculate total pages based on filtered products
    useEffect(() => {
        setTotalPages(Math.max(1, Math.ceil(filteredProducts.length / pageSize)));
        // Reset to page 1 when filters change
        setCurrentPage(1);
    }, [filteredProducts.length, pageSize]);

    // Get current page products
    const getCurrentPageProducts = () => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredProducts.slice(startIndex, startIndex + pageSize);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        // Scroll to top of the product grid
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    if (loading) {
        return <Loader/>
    }

    return (
        <div className="md:mx-auto md:max-w-7xl md:px-6 pt-5 px-4 lg:px-8 pb-16">
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="text-center mb-8"
            >
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
                    <FiInfo className="h-12 w-12 mb-4"/>
                    <p className="text-xl font-medium">Aucun produit ne correspond à votre recherche</p>
                </div>
            ) : (
                <div
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4
                     2xl:grid-cols-6 gap-4 md:gap-6">
                    {getCurrentPageProducts().map((produit: TypeProduit) => (
                        <motion.div
                            key={produit.id}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.4}}
                            className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md
                             transition-all duration-300 overflow-hidden flex flex-col h-full"
                        >
                            <div
                                className="relative w-full h-48 sm:h-40 md:h-48 flex items-center
                                 justify-center overflow-hidden bg-gray-50 rounded-t-xl">
                                <Image
                                    src={produit.image}
                                    width={400}
                                    height={400}
                                    className="max-h-full max-w-full object-contain p-2"
                                    placeholder="blur"
                                    blurDataURL="data:image/png;base64,
                                    iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P
                                    /BfwAJhAPYe0YQ1AAAAABJRU5ErkJggg=="
                                    quality={90}
                                    priority={true}
                                    alt={produit.nom}
                                />
                                <div
                                    className="absolute top-2 right-2 bg-gradient-to-r from-[#061e53] to-[#2563eb]
                                     backdrop-blur-sm text-xs font-medium text-white px-2 py-1 rounded-full shadow-sm">
                                    {produit.validite}
                                </div>
                            </div>

                            <div className="p-4 flex-grow flex flex-col">
                                <div className="flex-grow">
                                    <h2 className="text-lg font-semibold text-[#061e53] mb-1 line-clamp-1">
                                        {produit.nom}
                                    </h2>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {produit.description}
                                    </p>
                                </div>

                                <div className="mt-auto space-y-3">
                                    {/* Prix avec animation */}
                                    <motion.div
                                        className="flex justify-between items-center"
                                        whileHover={{scale: 1.03}}
                                        transition={{duration: 0.2}}
                                    >
                                        <span className="text-sm text-gray-500">Prix</span>
                                        <span className="font-bold text-lg text-[#061e53]">
                                            {Number(produit.prix).toLocaleString()} Ar
                                        </span>
                                    </motion.div>

                                    {/* Boutons d'action */}
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        {!panier.find(item => item.produit.id === produit.id) ? (
                                            <motion.button
                                                whileHover={{scale: 1.02}}
                                                whileTap={{scale: 0.98}}
                                                onClick={() => handleAddToCart(produit)}
                                                className="w-full py-2 px-3 bg-gradient-to-r from-[#061e53] to-[#2563eb] text-white rounded-lg font-medium
                                                    flex items-center justify-center space-x-1 hover:from-[#0c2b7a] hover:to-[#1d4ed8]
                                                    transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                                            >
                                                <FiShoppingCart className="h-4 w-4 mr-1"/>
                                                <span className="whitespace-nowrap">Ajouter au panier</span>
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
                                                <FiTrash className="h-4 w-4 mr-1"/>
                                                <span className="whitespace-nowrap">Retirer du panier</span>
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
                <div className="mt-12 flex justify-center">
                    <nav className="inline-flex rounded-md shadow-sm">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-l-md border border-gray-300 flex items-center
                             ${currentPage === 1 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                            <FiChevronLeft className="mr-1" /> Précédent
                        </button>

                        {/* Generate page buttons */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Logic to show pages around current page
                            let pageNum;
                            if (totalPages <= 5) {
                                // If 5 or fewer pages, show all
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                // If near start, show first 5 pages
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                // If near end, show last 5 pages
                                pageNum = totalPages - 4 + i;
                            } else {
                                // Otherwise show 2 before and 2 after current page
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 py-1 border ${
                                        i === 0 ? '' : 'border-l-0'
                                    } border-gray-300 ${
                                        currentPage === pageNum
                                            ? 'bg-blue-50 text-blue-600 font-medium'
                                            : 'bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-r-md border border-gray-300 flex items-center
                             ${currentPage === totalPages 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                            Suivant <FiChevronRight className="ml-1" />
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}
