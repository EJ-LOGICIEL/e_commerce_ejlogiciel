'use client';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {selectCurrentUser, updateUser} from '@/features/user/userSlice';
import {motion} from 'framer-motion';
import {ActionHistory, UserState} from "@/utils/types";
import {AppDispatch} from "@/redux/store";
import api from "@/lib/apis";
import {logout} from '@/lib/auth';
import {useRouter} from 'next/navigation';
import {
    FiCalendar,
    FiCheck,
    FiClock,
    FiLock,
    FiLogOut,
    FiMail,
    FiMapPin,
    FiPhone,
    FiShoppingBag,
    FiUser,
    FiX
} from 'react-icons/fi';


const MonCompte = () => {
    const user: UserState | null = useSelector(selectCurrentUser);
    const dispatch: AppDispatch = useDispatch();
    const router = useRouter();
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/se-connecter');
    };

    const [formData, setFormData] = useState({
        numero_telephone: user?.numero_telephone || '',
        email: user?.email || '',
        adresse: user?.adresse || '',
        current_password: '',
        new_password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        fetchActionHistory();
    }, []);

    const fetchActionHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const response = await api.get('/me/actions/');
            const actions: ActionHistory[] = response.data.actions;
            const sortedActions: ActionHistory[] = actions.sort((a, b) => b.id - a.id);
            setActionHistory(sortedActions);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setError(error?.response?.data?.error || "Une erreur est survenue");
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (name === 'new_password' || name === 'confirmPassword') {
            if (name === 'confirmPassword') {
                setPasswordMatch(value === formData.new_password);
            } else {
                setPasswordMatch(value === formData.confirmPassword || formData.confirmPassword === '');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.current_password) {
            setError('Le mot de passe actuel est requis pour toute modification');
            return;
        }

        if (formData.new_password && formData.new_password !== formData.confirmPassword) {
            setError('Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        const hasChanges =
            formData.numero_telephone !== user?.numero_telephone ||
            formData.email !== user?.email ||
            formData.adresse !== user?.adresse ||
            formData.new_password;

        if (!hasChanges) {
            return;
        }

        setIsLoading(true);

        try {
            const updateData: Record<string, string> = {
                numero_telephone: formData.numero_telephone,
                email: formData.email,
                adresse: formData.adresse,
                current_password: formData.current_password,
            };

            if (formData.new_password) {
                updateData['new_password'] = formData.new_password;
            }

            const response = await api.patch('/me/update/', updateData);

            dispatch(updateUser(response.data));

            setFormData({
                ...formData,
                current_password: '',
                new_password: '',
                confirmPassword: '',
            });

            setError(null);
        } catch {
            setError('Erreur lors de la mise à jour du profil');

        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOrderStatus = (action: ActionHistory) => {
        if (!action.livree || !action.payee) {
            return {
                label: 'En attente',
                color: 'bg-yellow-100 text-yellow-800',
                icon: <FiClock className="mr-1"/>
            };
        } else {
            return {
                label: 'Complétée',
                color: 'bg-green-100 text-green-800',
                icon: <FiCheck className="mr-1"/>
            };
        }
    };

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="max-w-6xl mx-auto p-4 md:p-6"
        >
            <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h1 className="text-3xl font-bold text-[#061e53]">Mon Compte</h1>
                <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    <FiLogOut className="mr-2"/> Se déconnecter
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-3">
                    <div className="mb-3 space-y-2 bg-gray-50 p-2 rounded-lg">
                        <h2 className="text-xl font-semibold text-[#061e53] mb-2">Informations personnelles</h2>

                        <div className="flex items-center">
                            <FiUser className="text-[#061e53] mr-3"/>
                            <div>
                                <label className="text-gray-600 text-sm">Nom d&#39;utilisateur</label>
                                <p className="font-medium">{user?.username}</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <FiUser className="text-[#061e53] mr-3"/>
                            <div>
                                <label className="text-gray-600 text-sm">Nom complet</label>
                                <p className="font-medium">{user?.nom_complet}</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <FiMail className="text-[#061e53] mr-3"/>
                            <div>
                                <label className="text-gray-600 text-sm">Email</label>
                                <p className="font-medium">{user?.email || 'Non défini'}</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <FiUser className="text-[#061e53] mr-3"/>
                            <div>
                                <label className="text-gray-600 text-sm">Code Utilisateur</label>
                                <p className="font-medium">{user?.code_utilisateur || 'Non défini'}</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            <div className="flex items-center">
                                <FiX className="mr-2"/>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-2">
                        <h2 className="text-xl font-semibold text-[#061e53] mb-2">Modifier mes informations</h2>

                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-gray-600 flex items-center">
                                <FiMail className="mr-2"/> Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="p-2 border rounded-md focus:ring-[#061e53]
                                 focus:border-[#061e53] focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="numero_telephone" className="text-gray-600 flex items-center">
                                <FiPhone className="mr-2"/> Numéro de téléphone
                            </label>
                            <input
                                type="tel"
                                id="numero_telephone"
                                name="numero_telephone"
                                value={formData.numero_telephone}
                                onChange={handleInputChange}
                                className="p-2 border rounded-md focus:ring-[#061e53]
                                 focus:border-[#061e53] focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="adresse" className="text-gray-600 flex items-center">
                                <FiMapPin className="mr-2"/> Adresse
                            </label>
                            <input
                                type="text"
                                id="adresse"
                                name="adresse"
                                value={formData.adresse}
                                onChange={handleInputChange}
                                className="p-2 border rounded-md focus:ring-[#061e53]
                                focus:border-[#061e53] focus:outline-none"
                            />
                        </div>

                        <div className="border-t pt-3">
                            <h2 className="text-xl font-semibold text-[#061e53] mb-2 flex items-center">
                                <FiLock className="mr-2"/> Modifier le mot de passe
                            </h2>

                            <div className="space-y-2">
                                <div className="flex flex-col">
                                    <label htmlFor="current_password" className="text-gray-600">
                                        Mot de passe actuel <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        id="current_password"
                                        name="current_password"
                                        value={formData.current_password}
                                        onChange={handleInputChange}
                                        className="p-2 border rounded-md focus:ring-[#061e53]
                                         focus:border-[#061e53] focus:outline-none"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Requis pour toute modification
                                    </p>
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="new_password" className="text-gray-600">
                                        Nouveau mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        id="new_password"
                                        name="new_password"
                                        value={formData.new_password}
                                        onChange={handleInputChange}
                                        className="p-2 border rounded-md focus:ring-[#061e53]
                                         focus:border-[#061e53] focus:outline-none"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="confirmPassword" className="text-gray-600">
                                        Confirmer le nouveau mot de passe
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className={`p-2 border rounded-md w-full focus:ring-[#061e53] 
                                            focus:border-[#061e53] focus:outline-none ${
                                                formData.confirmPassword && !passwordMatch ? 'border-red-500' : ''
                                            }`}
                                        />
                                        {formData.confirmPassword && (
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                {passwordMatch ? (
                                                    <FiCheck className="text-green-500"/>
                                                ) : (
                                                    <FiX className="text-red-500"/>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    {formData.confirmPassword && !passwordMatch && (
                                        <p className="text-red-500 text-sm mt-1">Les mots de passe ne correspondent
                                            pas</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center py-2 px-4 rounded-md
                             transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
                             focus:ring-[#061e53] ${
                                isLoading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#061e53] text-white hover:bg-[#0c2b7a]'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962
                                              7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Mise à jour en cours...
                                </>
                            ) : 'Enregistrer les modifications'}
                        </button>
                    </form>
                </div>

                <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-[#061e53] mb-4 flex items-center">
                        <FiShoppingBag className="mr-2"/> Historique des commandes
                    </h2>

                    {isLoadingHistory ? (
                        <div className="flex justify-center items-center h-64">
                            <svg className="animate-spin h-8 w-8 text-[#061e53]" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2
                                      5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                        </div>
                    ) : actionHistory && actionHistory.length > 0 ? (
                        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                            {actionHistory.map((action) => {
                                const status = getOrderStatus(action);
                                return (
                                    <div key={action.id}
                                         className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                action.type === 'achat' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {action.type === 'achat' ? 'Achat' : 'Devis'}
                                            </span>
                                            <span className="text-sm text-gray-500 flex items-center">
                                                <FiCalendar className="mr-1"/> {formatDate(action.date_action)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium">Référence: {action.code_action}</span>
                                            <span className="font-bold text-[#061e53] flex items-center">
                                           {Number(action.prix).toLocaleString()} Ar
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <div className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                                                {status.icon} {status.label}
                                            </div>

                                            <div className={`px-2 py-1 rounded-full text-xs ${
                                                action.livree ? 'bg-green-100 text-green-800' : 'bg-yellow-100' +
                                                    ' text-yellow-800'
                                            }`}>
                                                {action.livree ? (
                                                    <span className="flex items-center"><FiCheck
                                                        className="mr-1"/> Livrée</span>
                                                ) : (
                                                    <span className="flex items-center"><FiX
                                                        className="mr-1"/> Non livrée</span>
                                                )}
                                            </div>

                                            <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                                {action.methode_paiement_name}
                                            </div>
                                        </div>

                                        {action.elements_details && action.elements_details.length > 0 && (
                                            <div className="mt-3 pt-3 border-t">
                                                <p className="text-sm font-medium mb-2">Produits:</p>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {action.elements_details.map((item, idx) => (
                                                        <li key={idx} className="flex justify-between">
                                                            <span>{item.produit_nom}</span>
                                                            <span>x{item.quantite}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <FiShoppingBag className="text-4xl mb-2"/>
                            <p>Aucune commande trouvée</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MonCompte;
