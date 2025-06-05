'use client';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {selectCurrentUser, updateUser} from '@/features/user/userSlice';
import toast from 'react-hot-toast';
import {motion} from 'framer-motion';
import {TypeActions, UserState} from "@/utils/types";
import {AppDispatch} from "@/redux/store";
import api from "@/lib/apis";
import {FiCalendar, FiCheck, FiDollarSign, FiLock, FiMapPin, FiPhone, FiShoppingBag, FiUser, FiX} from 'react-icons/fi';

const MonCompte = () => {
    const user: UserState | null = useSelector(selectCurrentUser);
    const dispatch: AppDispatch = useDispatch();
    const actions: undefined | TypeActions[] = user?.actions
    const [passwordMatch, setPasswordMatch] = useState(true);

    const [formData, setFormData] = useState({
        numero_telephone: user?.numero_telephone || '',
        adresse: user?.adresse || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (name === 'newPassword' || name === 'confirmPassword') {
            if (name === 'confirmPassword') {
                setPasswordMatch(value === formData.newPassword);
            } else {
                setPasswordMatch(value === formData.confirmPassword || formData.confirmPassword === '');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            const response = await api.post('/user/update/', {
                ...formData,
                id: user?.id,
            });

            dispatch(updateUser(response.data));
            toast.success('Profil mis à jour avec succès');

            setFormData({
                ...formData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du profil');
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

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="max-w-6xl mx-auto p-4 md:p-6"
        >
            <h1 className="text-3xl font-bold mb-6 text-[#061e53] border-b pb-2">Mon Compte</h1>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6">
                    <div className="mb-6 space-y-4 bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold text-[#061e53] mb-4">Informations personnelles</h2>

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
                            <FiUser className="text-[#061e53] mr-3"/>
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-xl font-semibold text-[#061e53] mb-4">Modifier mes informations</h2>

                        <div className="flex flex-col">
                            <label htmlFor="numero_telephone" className="text-gray-600 flex items-center mb-1">
                                <FiPhone className="mr-2"/> Numéro de téléphone
                            </label>
                            <input
                                type="tel"
                                id="numero_telephone"
                                name="numero_telephone"
                                value={formData.numero_telephone}
                                onChange={handleInputChange}
                                className="mt-1 p-2 border rounded-md focus:ring-[#061e53] focus:border-[#061e53] focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="adresse" className="text-gray-600 flex items-center mb-1">
                                <FiMapPin className="mr-2"/> Adresse
                            </label>
                            <input
                                type="text"
                                id="adresse"
                                name="adresse"
                                value={formData.adresse}
                                onChange={handleInputChange}
                                className="mt-1 p-2 border rounded-md focus:ring-[#061e53] focus:border-[#061e53] focus:outline-none"
                            />
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-semibold text-[#061e53] mb-4 flex items-center">
                                <FiLock className="mr-2"/> Modifier le mot de passe
                            </h2>

                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <label htmlFor="currentPassword" className="text-gray-600">
                                        Mot de passe actuel
                                    </label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        className="mt-1 p-2 border rounded-md focus:ring-[#061e53] focus:border-[#061e53] focus:outline-none"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="newPassword" className="text-gray-600">
                                        Nouveau mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className="mt-1 p-2 border rounded-md focus:ring-[#061e53] focus:border-[#061e53] focus:outline-none"
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
                                            className={`mt-1 p-2 border rounded-md w-full focus:ring-[#061e53] focus:border-[#061e53] focus:outline-none ${
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
                            className="w-full bg-[#061e53] text-white py-2 px-4 rounded-md hover:bg-[#0c2b7a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#061e53]"
                        >
                            Enregistrer les modifications
                        </button>
                    </form>
                </div>

                <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-[#061e53] mb-4 flex items-center">
                        <FiShoppingBag className="mr-2"/> Historique des commandes
                    </h2>
                    {actions && actions.length > 0 ? (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {actions?.map((action, index) => (
                                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            action.type === 'achat' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
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
                                            <FiDollarSign className="mr-1"/> {Number(action.prix).toLocaleString()} Ar
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <div className={`px-2 py-1 rounded-full text-xs ${
                                            action.payee ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {action.payee ? (
                                                <span className="flex items-center"><FiCheck
                                                    className="mr-1"/> Payée</span>
                                            ) : (
                                                <span className="flex items-center"><FiX
                                                    className="mr-1"/> Non payée</span>
                                            )}
                                        </div>

                                        <div className={`px-2 py-1 rounded-full text-xs ${
                                            action.livree ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
                                            {action.methode_paiement}
                                        </div>
                                    </div>

                                    {action.elements && action.elements.length > 0 && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-sm font-medium mb-2">Produits:</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                {action.elements.map((item, idx) => (
                                                    <li key={idx} className="flex justify-between">
                                                        <span>{item.produit.nom}</span>
                                                        <span>x{item.quantite}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
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