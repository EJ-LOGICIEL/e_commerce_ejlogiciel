'use client';

import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {IoIosArrowRoundForward} from 'react-icons/io';
import {FaDesktop, FaKey, FaLaptop, FaRocket, FaShieldAlt} from 'react-icons/fa';
import Link from "next/link";
import {TypeCartItem, TypeProduit, UserState} from "@/utils/types";
import {useDispatch, useSelector} from "react-redux";
import {selectCurrentUser} from "@/features/user/userSlice";
import {
    ajouterAuPanier,
    fetchProduits,
    retirerDuPanier,
    selectLoading,
    selectPanier,
    selectProduits
} from "@/features/produit/produitSlice";
import Image from 'next/image';
import {AppDispatch} from '@/redux/store';
import {FiShoppingCart, FiTrash} from "react-icons/fi";

const sectionVariants = {
    hidden: {opacity: 0, y: 40},
    visible: {opacity: 1, y: 0},
};


// Format Ariary price with thousands separator
const formatAriary = (price: number): string => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export default function HomePage() {
    const user: UserState | null = useSelector(selectCurrentUser);
    const dispatch = useDispatch<AppDispatch>();
    const products = useSelector(selectProduits);
    const loading = useSelector(selectLoading);
    const [featuredProducts, setFeaturedProducts] = useState<TypeProduit[]>([]);
    const [heroProduct, setHeroProduct] = useState<TypeProduit | null>(null);
    const [currentProductIndex, setCurrentProductIndex] = useState<number>(0);
    const panier: TypeCartItem[] = useSelector(selectPanier);

    const handleAddToCart = (produit: TypeProduit) => {
        dispatch(ajouterAuPanier(produit));
    };

    useEffect(() => {
        dispatch(fetchProduits());
    }, [dispatch]);

    useEffect(() => {
        if (products.length > 0) {
            setFeaturedProducts(products.slice(0, 3));

            setHeroProduct(products[0]);
        }
    }, [products]);

    useEffect(() => {
        if (products.length === 0) return;

        const interval = setInterval(() => {
            setCurrentProductIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % products.length;
                setHeroProduct(products[nextIndex]);
                return nextIndex;
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [products]);

    return (
        <main
            className="text-gray-800 sm:px-6 py-6 space-y-8
             md:mx-auto md:max-w-6xl md:px-6 ">
            {/* HERO SECTION */}
            <motion.section
                className="md:flex items-center justify-end gap-12"
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                transition={{duration: 0.8}}
            >
                <div className="text-center md:text-left space-y-6 md:w-1/2">
                    <motion.h1
                        className="text-4xl md:text-5xl font-extrabold leading-tight"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5, delay: 0.3}}
                    >
                        Bienvenue chez <br/>
                        <span
                            className="bg-gradient-to-r md:text-7xl from-[#061e53] to-[#2563eb] text-transparent bg-clip-text">
                            EJ LOGICIEL
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-xl font-medium text-gray-700"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5, delay: 0.4}}
                    >
                        <span className="text-blue-600 font-bold">Licences officielles</span> • <span
                        className="text-blue-600 font-bold">Clés d&#39;activation</span> • <span
                        className="text-blue-600 font-bold">Appareils premium</span>
                    </motion.p>

                    <motion.p
                        className="text-lg text-gray-600"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5, delay: 0.5}}
                    >
                        Votre partenaire de confiance à Madagascar pour des solutions
                        logicielles authentiques et des
                        appareils de qualité à prix compétitifs.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center
                         md:justify-start gap-4 mt-8"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.6}}
                    >
                        <Link href={'/produits'} className="w-full sm:w-auto">
                            <motion.button
                                className="w-full bg-gradient-to-r from-[#061e53] to-[#2563eb]
                                 text-white px-8 py-3 rounded-full font-bold hover:shadow-xl
                                  hover:from-[#0c2b7a] hover:to-[#1d4ed8] transition-all
                                  duration-300 flex items-center justify-center"
                                whileHover={{
                                    scale: 1.05, boxShadow: "0 10px 25px -5px " +
                                        "rgba(59, 130, 246, 0.5)"
                                }}
                                whileTap={{scale: 0.98}}
                            >
                                <FaKey className="mr-2"/> Découvrir nos licences
                                <IoIosArrowRoundForward className="text-2xl ml-1"/>
                            </motion.button>
                        </Link>

                        {!user ? (
                            <Link href={'/se-connecter'} className="w-full sm:w-auto">
                                <motion.button
                                    className="w-full border-2 border-[#061e53] text-[#061e53] px-8 py-3
                                    rounded-full font-bold hover:bg-blue-50 hover:shadow-lg transition-all
                                     duration-300 flex items-center justify-center"
                                    whileHover={{scale: 1.05, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)"}}
                                    whileTap={{scale: 0.98}}
                                >
                                    <FaShieldAlt className="mr-2"/> Se connecter
                                </motion.button>
                            </Link>
                        ) : (
                            <Link href={'/mon-compte'} className="w-full sm:w-auto">
                                <motion.button
                                    className="w-full border-2 border-[#061e53] text-[#061e53] px-8 py-3 rounded-full
                                     font-bold hover:bg-blue-50 hover:shadow-lg transition-all duration-300
                                     flex items-center justify-center"
                                    whileHover={{scale: 1.05, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)"}}
                                    whileTap={{scale: 0.98}}
                                >
                                    <FaShieldAlt className="mr-2"/> Mon compte
                                </motion.button>
                            </Link>
                        )}
                    </motion.div>
                </div>

                <motion.div
                    className="w-full md:w-1/2 flex justify-center mt-10 md:mt-0"
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{
                        duration: 1,
                        delay: 0.3,
                    }}
                >
                    {heroProduct ? (
                        <div className="relative group">
                            <div
                                className="absolute -inset-1 z-[-12] bg-gradient-to-r
                                from-blue-100 to-indigo-100 rounded-2xl blur opacity-30
                                group-hover:opacity-70 transition-all duration-700"
                            ></div>
                            <div className="relative p-4 rounded-2xl shadow-2xl overflow-hidden">
                                <div
                                    className="absolute top-0 right-0 z-2 bg-gradient-to-r from-[#061e53] to-[#2563eb]
                                    text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                                    LICENCE OFFICIELLE
                                </div>
                                <Image
                                    src={heroProduct.image || "/produits/home-product.jpeg"}
                                    alt={heroProduct.nom}
                                    width={450}
                                    height={450}
                                    className="rounded-xl object-cover
                                         relative cursor-pointer hover:opacity-90 transition-opacity"
                                />
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg">{heroProduct.nom}</h3>
                                            <p className="text-blue-600 font-semibold">Licence {heroProduct.validite}</p>
                                        </div>
                                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                                            {formatAriary(heroProduct.prix)} Ar
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative group">
                            <div
                                className="absolute -inset-1 z-[-12] bg-gradient-to-r
                                from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 
                                group-hover:opacity-70 transition-all duration-700"
                            ></div>
                            <div className="relative bg-white p-4 rounded-2xl shadow-2xl overflow-hidden">
                                <div
                                    className="absolute top-0 right-0 bg-gradient-to-l from-blue-600
                                     to-indigo-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                                    LICENCE OFFICIELLE
                                </div>
                                <div
                                    className="h-[450px] w-[450px] flex items-center justify-center bg-gray-100 rounded-xl">
                                    <div
                                        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg">Chargement...</h3>
                                            <p className="text-blue-600 font-semibold">Veuillez patienter</p>
                                        </div>
                                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                                            ...
                                        </div>
                                    </div>
                                    <button disabled
                                            className="w-full bg-blue-400 text-white py-2 rounded-lg font-bold flex items-center justify-center cursor-not-allowed">
                                        <span>Chargement des produits</span>
                                        <div className="ml-2 animate-pulse">...</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.section>

            {/* POURQUOI CHOISIR EJ LOGICIEL */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                variants={sectionVariants}
                transition={{duration: 0.6}}
                viewport={{once: true}}
                className="text-center space-y-8 py-12"
            >
                <h2 className="text-3xl md:text-4xl font-bold text-[#061e53] mb-2">Pourquoi
                    choisir EJ LOGICIEL ?</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                    Nous nous engageons à vous fournir des solutions logicielles
                    authentiques et des appareils de
                    qualité supérieure
                </p>

                <div className="grid md:grid-cols-3 gap-8 text-left">
                    <motion.div
                        className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl
                         shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{y: -5}}
                    >
                        <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                            <FaKey className="text-blue-600 text-2xl"/>
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-[#061e53]">Licences 100% Authentiques</h3>
                        <p className="text-gray-600">
                            Toutes nos licences sont officielles, activables en ligne et
                            vérifiables sur les sites des
                            éditeurs.
                            Garantie à vie et support inclus.
                        </p>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl
                         shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{y: -5}}
                    >
                        <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                            <FaLaptop className="text-blue-600 text-2xl"/>
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-[#061e53]">Appareils Premium</h3>
                        <p className="text-gray-600">
                            Des ordinateurs, tablettes et périphériques de marques reconnues,
                            testés et configurés par
                            nos experts pour une performance optimale.
                        </p>
                    </motion.div>

                    <motion.div
                        className="bg-gradient-to-br from-blue-50 to-white p-8
                         rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{y: -5}}
                    >
                        <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                            <FaRocket className="text-blue-600 text-2xl"/>
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-[#061e53]">Livraison Instantanée</h3>
                        <p className="text-gray-600">
                            Recevez vos clés d&#39;activation par email en quelques minutes après
                            votre achat.
                            Activation
                            immédiate et sécurisée.
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* NOS PRODUITS VEDETTES */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                variants={sectionVariants}
                transition={{duration: 0.6}}
                viewport={{once: true}}
                className="text-center space-y-8 py-12 rounded-2xl shadow-lg"
            >
                <h2 className="text-3xl md:text-4xl font-bold text-[#061e53] mb-2">Nos Produits Vedettes</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                    Découvrez notre sélection de licences et d&#39;appareils les plus populaires
                </p>

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {featuredProducts.length > 0 ? (
                            featuredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
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
                                            src={product.image}
                                            width={400}
                                            height={400}
                                            className="max-h-full max-w-full object-contain p-2"
                                            placeholder="blur"
                                            blurDataURL="data:image/png;base64,
                                    iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P
                                    /BfwAJhAPYe0YQ1AAAAABJRU5ErkJggg=="
                                            quality={90}
                                            priority={true}
                                            alt={product.nom}
                                        />
                                        <div
                                            className="absolute top-2 right-2 bg-gradient-to-r from-[#061e53] to-[#2563eb]
                                     backdrop-blur-sm text-xs font-medium text-white px-2 py-1 rounded-full shadow-sm">
                                            {product.validite}
                                        </div>
                                    </div>

                                    <div className="p-4 flex-grow flex flex-col">
                                        <div className="flex-grow">
                                            <h2 className="text-lg font-semibold text-[#061e53] mb-1 line-clamp-1">
                                                {product.nom}
                                            </h2>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {product.description}
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
                                            {Number(product.prix).toLocaleString()} Ar
                                        </span>
                                            </motion.div>

                                            {/* Boutons d'action */}
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                {!panier.find(item => item.produit.id === product.id) ? (
                                                    <motion.button
                                                        whileHover={{scale: 1.02}}
                                                        whileTap={{scale: 0.98}}
                                                        onClick={() => handleAddToCart(product)}
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
                                                            dispatch(retirerDuPanier(product.id));
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
                            ))
                        ) : (
                            // Fallback if no products are available
                            <>
                                <motion.div
                                    className="rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                                    whileHover={{y: -5}}
                                >
                                    <div className="relative">
                                        <div
                                            className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg z-10">
                                            BESTSELLER
                                        </div>
                                        <div
                                            className="h-48 bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
                                            <FaKey className="text-6xl text-blue-500"/>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-xl mb-2 text-[#061e53]">Windows 11 Pro</h3>
                                        <p className="text-gray-600 mb-4">Licence à vie, activation en ligne</p>
                                        <div className="flex justify-between items-center">
                                            <span
                                                className="text-blue-600 font-bold text-xl">{formatAriary(202500)} Ar</span>
                                            <Link href="/produits">
                                                <button
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                                                    Voir détails
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className=" rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                                    whileHover={{y: -5}}
                                >
                                    <div className="relative">
                                        <div
                                            className="h-48 bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
                                            <FaDesktop className="text-6xl text-blue-500"/>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-xl mb-2 text-[#061e53]">Microsoft Office 2021</h3>
                                        <p className="text-gray-600 mb-4">Suite complète, licence perpétuelle</p>
                                        <div className="flex justify-between items-center">
                                            <span
                                                className="text-blue-600 font-bold text-xl">{formatAriary(292500)} Ar</span>
                                            <Link href="/produits">
                                                <button
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                                                    Voir détails
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className=" rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                                    whileHover={{y: -5}}
                                >
                                    <div className="relative">
                                        <div
                                            className="absolute top-0 right-0 bg-gradient-to-l from-green-600 to-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg z-10">
                                            PROMO
                                        </div>
                                        <div
                                            className="h-48 bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
                                            <FaLaptop className="text-6xl text-blue-500"/>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-xl mb-2 text-[#061e53]">Antivirus Premium</h3>
                                        <p className="text-gray-600 mb-4">Protection complète, 3 appareils</p>
                                        <div className="flex justify-between items-center">
                                            <span
                                                className="text-blue-600 font-bold text-xl">{formatAriary(175500)} Ar</span>
                                            <Link href="/produits">
                                                <button
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                                                    Voir détails
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </div>
                )}

                <div className="mt-10">
                    <Link href="/produits">
                        <motion.button
                            className=" border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-all duration-300 inline-flex items-center"
                            whileHover={{scale: 1.03}}
                            whileTap={{scale: 0.98}}
                        >
                            Voir tous nos produits
                            <IoIosArrowRoundForward className="text-2xl ml-1"/>
                        </motion.button>
                    </Link>
                </div>
            </motion.section>

            {/* AVIS CLIENTS */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                variants={sectionVariants}
                transition={{duration: 0.6}}
                viewport={{once: true}}
                className="text-center space-y-8 py-12 rounded-2xl shadow-lg"
            >
                <h2 className="text-3xl md:text-4xl font-bold text-[#061e53] mb-2">Ce que nos clients disent</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                    La satisfaction de nos clients est notre priorité absolue
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                    <motion.blockquote
                        className="bg-white p-6 rounded-xl shadow-md relative"
                        whileHover={{y: -5}}
                    >
                        <div
                            className="absolute -top-4 left-6 bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full">
                            <span className="text-xl">&#34;</span>
                        </div>
                        <p className="mt-4 text-gray-700">J&#39;ai acheté Windows 11 à un prix imbattable, tout
                            fonctionne
                            parfaitement ! Le processus d&#39;activation était simple et rapide.</p>
                        <footer className="mt-4 flex items-center">
                            <div
                                className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                RM
                            </div>
                            <div className="ml-3">
                                <p className="font-semibold text-[#061e53]">Roméo Manoela</p>
                                <p className="text-sm text-gray-500">Client satisfait</p>
                            </div>
                        </footer>
                    </motion.blockquote>

                    <motion.blockquote
                        className="bg-white p-6 rounded-xl shadow-md relative"
                        whileHover={{y: -5}}
                    >
                        <div
                            className="absolute -top-4 left-6 bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full">
                            <span className="text-xl">&#34;</span>
                        </div>
                        <p className="mt-4 text-gray-700">Service client au top. Ils m&#39;ont aidé à installer Office
                            sans
                            stress. Je recommande vivement pour leur professionnalisme.</p>
                        <footer className="mt-4 flex items-center">
                            <div
                                className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                MK
                            </div>
                            <div className="ml-3">
                                <p className="font-semibold text-[#061e53]">Mika</p>
                                <p className="text-sm text-gray-500">Client fidèle</p>
                            </div>
                        </footer>
                    </motion.blockquote>

                    <motion.blockquote
                        className="bg-white p-6 rounded-xl shadow-md relative"
                        whileHover={{y: -5}}
                    >
                        <div
                            className="absolute -top-4 left-6 bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full">
                            <span className="text-xl">&#34;</span>
                        </div>
                        <p className="mt-4 text-gray-700">Très professionnels, je recommande à 100%. Les clés
                            d&#39;activation sont livrées rapidement et fonctionnent parfaitement.</p>
                        <footer className="mt-4 flex items-center">
                            <div
                                className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                JM
                            </div>
                            <div className="ml-3">
                                <p className="font-semibold text-[#061e53]">Joël M.</p>
                                <p className="text-sm text-gray-500">Client entreprise</p>
                            </div>
                        </footer>
                    </motion.blockquote>
                </div>
            </motion.section>
        </main>
    );
}
