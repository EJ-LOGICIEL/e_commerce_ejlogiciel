'use client';

import {motion} from 'framer-motion';
import Image from 'next/image';
import {IoIosArrowRoundForward} from 'react-icons/io';
import Link from "next/link";
import {UserState} from "@/utils/types";
import {useSelector} from "react-redux";
import {selectCurrentUser} from "@/features/user/userSlice";

const sectionVariants = {
    hidden: {opacity: 0, y: 40},
    visible: {opacity: 1, y: 0},
};

export default function HomePage() {
    const user: UserState | null = useSelector(selectCurrentUser)
    return (
        <main className="text-gray-800 px-6 py-12 space-y-24 max-w-7xl mx-auto">
            {/* HERO SECTION */}
            <motion.section
                className="md:flex items-center justify-between gap-12"
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                transition={{duration: 0.8}}
            >
                <div className="text-center md:text-left space-y-6 md:w-1/2">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#061e53] leading-tight">
                        Bienvenue chez <br/>
                        <span className="text-[#061e53]">EJ LOGICIEL</span>
                    </h1>
                    <p className="text-xl font-medium">
                        Des logiciels officiels. Des appareils premium. Un service fiable.
                    </p>
                    <p className="text-lg">
                        On t’aide à t’équiper avec ce qu’il y a de mieux — sans te ruiner, et sans prise de tête.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-6">
                        <button
                            className="bg-[#061e53] text-white px-6 py-3 rounded-full font-bold hover:bg-black transition">
                            <Link href={'/produits'}>
                                Découvrir nos produits <IoIosArrowRoundForward className="inline text-2xl ml-1"/>
                            </Link>
                        </button>
                        {!user ? <button
                            className="border border-[#061e53] text-[#061e53] px-6 py-3 rounded-full font-bold hover:bg-[#061e53] hover:text-white transition">
                            <Link href={'/se-connecter'}>
                                Se connecter
                            </Link>
                        </button> : <button
                            className="border border-[#061e53] text-[#061e53] px-6 py-3 rounded-full font-bold hover:bg-[#061e53] hover:text-white transition">
                            <Link href={'/mon-compte'}>
                                Mon compte
                            </Link>
                        </button>}
                    </div>
                </div>
                <div className="w-full md:w-1/2 flex justify-center">
                    <Image
                        src="/produits/home-product.jpeg"
                        alt="Produit vedette"
                        width={400}
                        height={400}
                        className="rounded-xl shadow-xl object-cover"
                    />
                </div>
            </motion.section>

            {/* POURQUOI CHOISIR EJ LOGICIEL */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                variants={sectionVariants}
                transition={{duration: 0.6}}
                viewport={{once: true}}
                className="text-center space-y-8"
            >
                <h2 className="text-3xl font-bold text-[#061e53]">Pourquoi choisir EJ LOGICIEL ?</h2>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                    <div className="p-6 rounded-lg shadow">
                        <h3 className="font-semibold text-xl mb-2">🛡️ Logiciels légitimes</h3>
                        <p>Nous ne vendons que des licences authentiques, activables en ligne et vérifiables sur les
                            sites officiels.
                            Fini les versions piratées.</p>
                    </div>
                    <div className=" p-6 rounded-lg shadow">
                        <h3 className="font-semibold text-xl mb-2">🤝 Support humain</h3>
                        <p>Nous accompagnons chaque client avec attention et patience, même après la vente.</p>
                    </div>
                    <div className=" p-6 rounded-lg shadow">
                        <h3 className="font-semibold text-xl mb-2">⚡ Livraison immédiate</h3>
                        <p>Une fois ton paiement validé, ta clé de licence te parvient par email en quelques minutes.
                            Tu peux ainsi activer ton logiciel sans attendre, et commencer
                            à l’utiliser immédiatement. Tout est automatisé, rapide, et sécurisé.</p>
                    </div>
                </div>
            </motion.section>

            {/* AVIS CLIENTS */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                variants={sectionVariants}
                transition={{duration: 0.6}}
                viewport={{once: true}}
                className="text-center space-y-6"
            >
                <h2 className="text-3xl font-bold text-[#061e53]">Ce que nos clients disent</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <blockquote className=" p-6 rounded">
                        <p>“J’ai acheté Windows 11 à un prix imbattable, tout fonctionne !”</p>
                        <footer className="text-sm mt-2 text-gray-600">— Roméo Manoela.</footer>
                    </blockquote>
                    <blockquote className=" p-6 ">
                        <p>“Service client au top. Ils m’ont aidé à installer Office sans stress.”</p>
                        <footer className="text-sm mt-2 text-gray-600">— Mika.</footer>
                    </blockquote>
                    <blockquote className="p-6">
                        <p>“Très professionnels, je recommande à 100 %.”</p>
                        <footer className="text-sm mt-2 text-gray-600">— Joël M.</footer>
                    </blockquote>

                </div>
            </motion.section>
        </main>
    );
}
