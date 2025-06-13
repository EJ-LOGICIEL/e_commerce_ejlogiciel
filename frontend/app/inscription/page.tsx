'use client';

import React, {useState} from 'react';
import {UserState} from '@/utils/types';
import Link from "next/link";
import {authenticate} from "@/lib/auth";
import {AnimatePresence, motion} from "framer-motion";
import {useRouter} from "next/navigation";

const initialRegisterData: Partial<UserState & { password: string, confirmPassword: string }> = {
    username: '',
    nom_complet: '',
    role: 'client',
    type: 'particulier',
    numero_telephone: '',
    adresse: '',
    email: '',
    code_utilisateur: '',
    nif: '',
    rcs: '',
    stats: '',
    password: '',
    confirmPassword: '',
};

export default function AuthPage() {
    const [registerData, setRegisterData] = useState(initialRegisterData);
    const [error, setError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setRegisterData(prev => ({...prev, [name]: value}));

        if (name === 'password' || name === 'confirmPassword') {
            if (name === 'password' && value.length < 8) {
                setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
            } else if (name === 'confirmPassword' && value !== registerData.password) {
                setPasswordError('Les mots de passe ne correspondent pas');
            } else if (name === 'password' && registerData.confirmPassword && value !== registerData.confirmPassword) {
                setPasswordError('Les mots de passe ne correspondent pas');
            } else {
                setPasswordError(null);
            }
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (registerData.password !== registerData.confirmPassword) {
            setPasswordError('Les mots de passe ne correspondent pas');
            return;
        }

        if (registerData.password && registerData.password.length < 8) {
            setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }
        setIsLoading(true)
        const res: number | true | null = await authenticate(registerData, 'signup');
        if (res === true) {
            router.push('/produits')
            setRegisterData(initialRegisterData);
            setIsLoading(false);
            return
        }
        if (res === 400) {
            setError('Nom d\'utilisateur existe dèjà');
        } else {
            setError('Une erreur est survenue lors de l\'inscription');
        }
        setIsLoading(false)
        return

    };

    return (
        <div className="py-6 px-2 sm:px-4 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden">
                <div className="px-2 py-4">
                    <AnimatePresence>
                        {(error || passwordError) && (
                            <motion.div
                                initial={{opacity: 0, y: -20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -20}}
                                className="mb-2"
                            >
                                <div className="bg-red-100 p-2 rounded-lg md:max-w-[420px] mx-auto">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20"
                                                 fill="currentColor">
                                                <path fillRule="evenodd"
                                                      d="M10 18a8 8 0 100-16 8 8 0 000
                                                      16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586
                                                       10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293
                                                       1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0
                                                       00-1.414-1.414L10 8.586 8.707 7.293z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">
                                                {error || passwordError}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleRegisterSubmit}>
                        <div className="text-center mb-4">
                            <h2 className="text-3xl font-extrabold text-[#061e53]">Créer un compte</h2>
                            <p className="mt-2 text-sm text-gray-600">Rejoignez-nous pour commencer votre expérience</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label htmlFor="username" className="text-sm font-medium text-gray-700">Nom
                                    d&#39;utilisateur</label>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    required
                                    value={registerData.username}
                                    onChange={handleRegisterChange}
                                    className="appearance-none block w-full px-3 py-1 border
                                    border-gray-300 rounded-lg shadow-sm placeholder-gray-400
                                    focus:outline-none focus:ring-[#061e53] focus:border-[#061e53]
                                     transition duration-150 ease-in-out"
                                />
                            </div>

                            <div>
                                <label htmlFor="nom_complet" className="text-sm font-medium text-gray-700">Nom
                                    complet</label>
                                <input
                                    id="nom_complet"
                                    type="text"
                                    name="nom_complet"
                                    required
                                    value={registerData.nom_complet}
                                    onChange={handleRegisterChange}
                                    className="appearance-none block w-full px-3 py-1 border
                                     border-gray-300 rounded-lg shadow-sm placeholder-gray-400
                                     focus:outline-none focus:ring-[#061e53] focus:border-[#061e53]"
                                />
                            </div>

                            <div>
                                <label htmlFor="type" className="text-sm font-medium text-gray-700">Type de
                                    compte</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={registerData.type}
                                    onChange={handleRegisterChange}
                                    className="block w-full px-3 py-1 border border-gray-300
                                    rounded-lg shadow-sm focus:outline-none focus:ring-[#061e53]
                                     focus:border-[#061e53]"
                                >
                                    <option value="particulier">Particulier</option>
                                    <option value="entreprise">Entreprise</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="numero_telephone"
                                       className="text-sm font-medium text-gray-700">Téléphone</label>
                                <input
                                    id="numero_telephone"
                                    type="text"
                                    name="numero_telephone"
                                    required
                                    value={registerData.numero_telephone}
                                    onChange={handleRegisterChange}
                                    className="appearance-none block w-full px-3 py-1 border
                                     border-gray-300 rounded-lg shadow-sm placeholder-gray-400
                                      focus:outline-none focus:ring-[#061e53] focus:border-[#061e53]"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    className="appearance-none block w-full px-3 py-1 border
                                    border-gray-300 rounded-lg shadow-sm placeholder-gray-400
                                     focus:outline-none focus:ring-[#061e53] focus:border-[#061e53]"
                                />
                            </div>

                            <div>
                                <label htmlFor="adresse" className="text-sm font-medium text-gray-700">Adresse</label>
                                <input
                                    id="adresse"
                                    type="text"
                                    name="adresse"
                                    required
                                    value={registerData.adresse}
                                    onChange={handleRegisterChange}
                                    className="appearance-none block w-full px-3 py-1 border
                                     border-gray-300 rounded-lg shadow-sm placeholder-gray-400
                                      focus:outline-none focus:ring-[#061e53] focus:border-[#061e53]"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de
                                    passe</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    minLength={8}
                                    value={registerData.password}
                                    onChange={handleRegisterChange}
                                    className="appearance-none block w-full px-3 py-1 border border-gray-300
                                    rounded-lg shadow-sm placeholder-gray-400 focus:outline-none
                                    focus:ring-[#061e53] focus:border-[#061e53]"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirmer
                                    le mot de passe</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    minLength={8}
                                    value={registerData.confirmPassword}
                                    onChange={handleRegisterChange}
                                    className="appearance-none block w-full px-3 py-1 border
                                    border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none
                                     focus:ring-[#061e53] focus:border-[#061e53]"
                                />
                            </div>

                            {registerData.type === 'entreprise' && (
                                <>
                                    <div>
                                        <label htmlFor="nif" className="text-sm font-medium text-gray-700">NIF</label>
                                        <input
                                            id="nif"
                                            type="text"
                                            name="nif"
                                            value={registerData.nif}
                                            onChange={handleRegisterChange}
                                            className="appearance-none block w-full px-3 py-1 border border-gray-300
                                             rounded-lg shadow-sm placeholder-gray-400 focus:outline-none
                                             focus:ring-[#061e53] focus:border-[#061e53]"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="rcs" className="text-sm font-medium text-gray-700">RCS</label>
                                        <input
                                            id="rcs"
                                            type="text"
                                            name="rcs"
                                            value={registerData.rcs}
                                            onChange={handleRegisterChange}
                                            className="appearance-none block w-full px-3 py-1 border
                                             border-gray-300 rounded-lg shadow-sm placeholder-gray-400
                                             focus:outline-none focus:ring-[#061e53] focus:border-[#061e53]"
                                        />
                                    </div>

                                    <div className="">
                                        <label htmlFor="stats"
                                               className="text-sm font-medium text-gray-700">STAT</label>
                                        <input
                                            id="stats"
                                            type="text"
                                            name="stats"
                                            value={registerData.stats}
                                            onChange={handleRegisterChange}
                                            className="appearance-none block w-full px-3 py-1 border
                                            border-gray-300 rounded-lg shadow-sm placeholder-gray-400
                                             focus:outline-none focus:ring-[#061e53] focus:border-[#061e53]"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="mt-4 flex flex-col items-center">
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{scale: !isLoading ? 1.02 : 1}}
                                whileTap={{scale: !isLoading ? 0.98 : 1}}
                                className={`py-3 px-6 rounded-full text-base font-medium transition-all duration-200
                                    ${isLoading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#061e53] text-white hover:bg-[#0c2b7a] shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        inscription en cours...
                                    </div>
                                ) : "S'inscrire"}
                            </motion.button>

                            <Link
                                href={'/se-connecter'}
                                className="mt-4 text-sm text-gray-600 hover:text-[#061e53]
                                 transition-colors duration-200"
                            >
                                Vous avez déjà un compte ? Connectez-vous !
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}