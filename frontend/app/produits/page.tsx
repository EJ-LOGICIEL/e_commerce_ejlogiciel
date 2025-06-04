'use client';

import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {motion} from 'framer-motion';
import {FiInfo, FiShoppingCart, FiTrash} from 'react-icons/fi';
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
    const filteredProducts = produits
        .filter(product =>
            (selectedValidite === 'all' || product.validite === selectedValidite)
            &&
            product.nom.toLowerCase().includes(searchQuery.toLowerCase())
        );


    useEffect(() => {
        dispatch(fetchProduits());
    }, [dispatch]);

    const handleAddToCart = (produit: TypeProduit) => {
        dispatch(ajouterAuPanier(produit));
    };

    if (error) {
        return (
            <div className="flex items-center justify-center">
                <div className="text-red-600 text-center">
                    <FiInfo className="mx-auto h-12 w-12 mb-4"/>
                    <p className="text-xl font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-5 px-4 lg:px-8">
            {loading && <Loader/>}
            <h1 className="text-3xl font-bold text-[#061e53] mb-3 text-center">
                Nos Produits
            </h1>

            <div className={'mb-3 flex gap-2 items-center max-w-[40%] mx-auto'}>
                {/* Barre de recherche */}
                <div>
                    <div className="">
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-4 py-2 pr-10 rounded-lg border border-gray-300 inline"
                        />
                    </div>
                </div>

                {/* Filtres */}
                <div>
                    <label htmlFor="validite-filter" className="font-semibold text-[#061e53]">
                        Filtrer par validité
                    </label>
                    <select
                        id="validite-filter"
                        value={selectedValidite}
                        onChange={(e) => setSelectedValidite(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-md "
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

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {filteredProducts.map((produit: TypeProduit) => (
                    <motion.div
                        key={produit.id}
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5}}
                        className="flex flex-col bg-white"
                    >
                        <Image
                            src={produit.image}
                            width={400}
                            height={400}
                            className="rounded-t-lg object-cover w-full h-[200px]"
                            placeholder="blur"
                            blurDataURL={produit.image}
                            quality={100}
                            priority={true}
                            loading="eager"
                            alt={produit.nom}
                        />


                        <div className="mt-[-20px] p-2">
                            <h2 className="text-lg pt-1 font-semibold text-center text-[#061e53]">
                                {produit.nom}
                            </h2>
                            <p className="text-gray-600 pt-1 text-center text-sm">
                                {produit.description}
                            </p>
                            <p className="text-gray-600 pt-1 text-center text-sm">
                                <span className={'font-semibold'}>Validité:</span>{produit.validite}
                            </p>
                            <div className="text-center pt-1 text-sm">
                                <span className="text-gray-500">Prix: </span>
                                <span className="font-semibold text-[#061e53]">
                                    {Number(produit.prix).toLocaleString()} Ar
                                </span>
                            </div>
                            {!panier.find(item => item.id === produit.id) ? <motion.button
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                onClick={() => handleAddToCart(produit)}
                                className="w-full mt-1 py-2 px-3 bg-[#061e53] text-white rounded-full font-medium
                             flex items-center justify-center space-x-1 hover:bg-[#0c2b7a]
                             transition-colors duration-200 shadow-md hover:shadow-lg text-sm"
                            >
                                <FiShoppingCart className="h-4 w-4"/>
                                <span>Ajouter au panier</span>
                            </motion.button> : <motion.button
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                onClick={() => {
                                    dispatch(retirerDuPanier(produit.id));
                                }}
                                className="w-full mt-1 py-2 px-3 bg-red-500 text-white rounded-full font-medium
                             flex items-center justify-center space-x-1 hover:bg-red-600
                             transition-colors duration-200 shadow-md hover:shadow-lg text-sm"
                            >
                                <FiTrash className="h-4 w-4"/>
                                <span>Retirer du panier</span>
                            </motion.button>}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}