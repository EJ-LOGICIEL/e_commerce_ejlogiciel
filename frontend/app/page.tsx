'use client';

import {motion} from 'framer-motion';
import {IoIosArrowRoundForward} from 'react-icons/io';
import Link from "next/link";
import {UserState} from "@/utils/types";
import {useSelector} from "react-redux";
import {selectCurrentUser} from "@/features/user/userSlice";
import Image from 'next/image';

const sectionVariants = {
    hidden: {opacity: 0, y: 40},
    visible: {opacity: 1, y: 0},
};
export default function HomePage() {
    const user: UserState | null = useSelector(selectCurrentUser);

    return (
        <main className="text-gray-800 px-6 py-12 space-y-5 md:mx-auto md:max-w-6xl md:px-6">
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
                        Des logiciels officiels. Des appareils premium. Un service fiable.
                    </motion.p>

                    <motion.p
                        className="text-lg text-gray-600"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5, delay: 0.5}}
                    >
                        On t&#39;aide à t&#39;équiper avec ce qu&#39;il y a de mieux — sans te ruiner, et sans prise de
                        tête.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-8"
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.6}}
                    >
                        <Link href={'/produits'} className="w-full sm:w-auto">
                            <motion.button
                                className="w-full bg-gradient-to-r from-[#061e53] to-[#2563eb] text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:from-[#0c2b7a] hover:to-[#1d4ed8] transition-all duration-300 flex items-center justify-center"
                                whileHover={{scale: 1.03}}
                                whileTap={{scale: 0.98}}
                            >
                                Découvrir nos produits
                                <IoIosArrowRoundForward className="text-2xl ml-1"/>
                            </motion.button>
                        </Link>

                        {!user ? (
                            <Link href={'/se-connecter'} className="w-full sm:w-auto">
                                <motion.button
                                    className="w-full border-2 border-[#061e53] text-[#061e53] px-8 py-3 rounded-full font-bold hover:bg-blue-50 hover:shadow-md transition-all duration-300"
                                    whileHover={{scale: 1.03}}
                                    whileTap={{scale: 0.98}}
                                >
                                    Se connecter
                                </motion.button>
                            </Link>
                        ) : (
                            <Link href={'/mon-compte'} className="w-full sm:w-auto">
                                <motion.button
                                    className="w-full border-2 border-[#061e53] text-[#061e53] px-8 py-3 rounded-full font-bold hover:bg-blue-50 hover:shadow-md transition-all duration-300"
                                    whileHover={{scale: 1.03}}
                                    whileTap={{scale: 0.98}}
                                >
                                    Mon compte
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
                    <div className="relative">
                        <div
                            className="absolute -inset-1 z-[-12] bg-gradient-to-r
                            from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"
                        ></div>
                        <Image
                            src="/produits/home-product.jpeg"
                            alt="Produit vedette"
                            width={450}
                            height={450}
                            className="rounded-2xl shadow-2xl object-cover relative"
                        />
                    </div>
                </motion.div>

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