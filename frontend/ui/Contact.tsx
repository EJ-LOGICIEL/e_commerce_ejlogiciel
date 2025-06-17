'use client';
import {FaFacebookF, FaLinkedinIn} from 'react-icons/fa';
import Link from "next/link";
import {useDispatch, useSelector} from "react-redux";
import {selectCurrentUser, updateUser} from "@/features/user/userSlice";
import React, {useState} from 'react';
import api from '@/lib/apis';
import {UserState} from "@/utils/types";
import {AppDispatch} from "@/redux/store";

export default function Contact() {
    const user: UserState | null = useSelector(selectCurrentUser);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string>(`${user !== null ? "Un client, un avis ☺️" :
        "Vous devez être " +
        "connecté pour donner votre avis. merci "}`);
    const [disable, setDisable] = useState<boolean>(user === null || user?.avis !== null)
    const dispatch: AppDispatch = useDispatch();
    const [formData, setFormData] = useState({
        avis: ''
    });


    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setMessage('')
    };


    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.avis) {
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/contact/avis/', formData);
            setFormData({
                ...formData,
                avis: ''
            });
            const user_info = await api.get('/me/');
            dispatch(updateUser(user_info.data));
            setMessage("Nous avous bien reçu votre avis, merci 🙏")
            setDisable(true)
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            if (error?.status === 400) setMessage("Vous avez déjà donné votre avis")
            else
                setMessage('Une erreur est survenue');
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
                        <textarea
                            name="avis"
                            placeholder="Votre avis ici..."
                            rows={4}
                            value={message === "" ? formData.avis : message}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#061e53]"
                            required
                        />
                        <button
                            type="submit"
                            disabled={disable || isLoading}
                            className={`bg-[#061e53] text-white w-full py-2 rounded-full hover:bg-black transition font-medium ${
                                disable || isLoading ? 'opacity-70 cursor-not-allowed' : ''
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
