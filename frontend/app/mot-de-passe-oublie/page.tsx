'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import {AnimatePresence, motion} from 'framer-motion';
import api from '@/lib/apis';

export default function MotDePasseOubliePage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            await api.post('/mot-de-passe/', {email});
            setSuccess('Un email de réinitialisation a été envoyé à votre adresse email.');
            setEmail('');
        } catch (error) {
            // @ts-expect-error - error handling
            if (error?.status === 404) {
                setError('Aucun utilisateur trouvé avec cette adresse email.');
            } else {
                setError('Une erreur est survenue. Veuillez réessayer plus tard.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full overflow-hidden">
                <div className="px-8 py-12">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{opacity: 0, y: -20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -20}}
                                className="mb-6"
                            >
                                <div className="bg-red-100 p-2 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20"
                                                 fill="currentColor">
                                                <path fillRule="evenodd"
                                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                initial={{opacity: 0, y: -20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -20}}
                                className="mb-6"
                            >
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20"
                                                 fill="currentColor">
                                                <path fillRule="evenodd"
                                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-green-700">{success}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="text-center mb-8">
                        <motion.h2
                            initial={{y: -20}}
                            animate={{y: 0}}
                            className="text-3xl font-extrabold text-[#061e53]"
                        >
                            Mot de passe oublié
                        </motion.h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Entrez votre adresse email pour réinitialiser votre mot de passe
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Adresse email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 
                                         focus:outline-none focus:ring-[#061e53] focus:border-[#061e53] transition duration-150 ease-in-out"
                                placeholder="Entrez votre adresse email"
                            />
                        </div>

                        <div className="mt-8">
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{scale: !isLoading ? 1.02 : 1}}
                                whileTap={{scale: !isLoading ? 0.98 : 1}}
                                className={`w-full py-3 px-6 rounded-full text-base font-medium transition-all duration-200
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
                                        Envoi en cours...
                                    </div>
                                ) : 'Réinitialiser le mot de passe'}
                            </motion.button>

                            <div className="mt-6 text-center">
                                <Link
                                    href="/se-connecter"
                                    className="text-sm text-gray-600 hover:text-[#061e53] transition-colors duration-200"
                                >
                                    Retour à la page de connexion
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}