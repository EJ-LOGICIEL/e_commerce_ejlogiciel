'use client';
import {FaFacebookF, FaLinkedinIn} from 'react-icons/fa';
import Link from "next/link";
import {useSelector} from "react-redux";
import {selectCurrentUser} from "@/features/user/userSlice";
import React, {useState} from 'react';
import api from '@/lib/apis';
import toast from 'react-hot-toast';

export default function Contact() {
    const user = useSelector(selectCurrentUser);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        avis: ''
    });

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.avis) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/contact/avis/', formData);
            toast.success(response.data.detail || 'Votre avis a été envoyé avec succès');

            setFormData({
                ...formData,
                avis: ''
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'avis:', error);
            const errorMessage = error.response?.data?.error || 'Une erreur est survenue lors de l\'envoi de votre avis';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <footer className="bg-white text-center text-gray-700 px-6 md:px-20 py-5">
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Logo & description */}
                <div>
                    <h2 className="text-2xl font-bold text-[#061e53]">EJ LOGICIEL</h2>
                    <p className="mt-4 text-sm text-gray-600">
                        Des logiciels 100% légitimes, des appareils premium, et un service humain qui t&#39;accompagne
                        de A à Z.
                    </p>
                    <div className="flex justify-center space-x-4 mt-4">
                        <Link href={'https://web.facebook.com/esoalahy'}
                              className="p-2 bg-[#061e53] text-white rounded-full"><FaFacebookF/></Link>
                        <Link href={'https://www.linkedin.com/company/ej-logiciel'}
                              className="p-2 bg-[#061e53] text-white rounded-full"><FaLinkedinIn/></Link>
                    </div>
                </div>

                {/* Menu */}
                <div>
                    <h3 className="font-semibold text-[#061e53] mb-4">Menu</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/" className="hover:text-[#061e53]">Accueil</Link></li>
                        <li><Link href="/produits" className="hover:text-[#061e53]">Produits</Link></li>
                        <li><a href={user ? '/mon-compte' : '/se-connecter'} className="hover:text-[#061e53]">Mon
                            compte</a></li>
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h3 className="font-semibold text-[#061e53] mb-4">Support</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="mailto:esoalahyjosefa@gmail.com"
                                  className="hover:text-[#061e53]">esoalahyjosefa@gmail.com</Link></li>
                        <li className="hover:text-[#061e53]">+261 34 50 035 13</li>
                    </ul>

                </div>
                {/* Formulaire de retour */}
                <div>
                    <h3 className="font-semibold text-[#061e53] mb-3 text-lg">Donner votre avis</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Votre retour compte pour nous. Partagez vos impressions ou suggestions.
                    </p>

                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Votre adresse email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#061e53]"
                            required
                        />
                        <textarea
                            name="avis"
                            placeholder="Votre avis ici..."
                            rows={4}
                            value={formData.avis}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#061e53]"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`bg-[#061e53] text-white w-full py-2 rounded-full hover:bg-black transition font-medium ${
                                isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? 'Envoi en cours...' : 'Envoyer'}
                        </button>
                    </form>
                </div>

            </div>

            {/* Bottom note */}
            <div className="mt-5 text-center text-sm text-gray-500 border-t pt-6">
                © {new Date().getFullYear()} EJ LOGICIEL. Tous droits réservés.
            </div>
        </footer>
    );
}
