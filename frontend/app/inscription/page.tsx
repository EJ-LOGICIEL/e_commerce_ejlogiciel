'use client';

import React, {useState} from 'react';
import {authenticate} from '@/lib/auth';
import {UserState} from '@/utils/types';
import Link from "next/link";

const initialRegisterData: Partial<UserState> = {
    username: '',
    nom_complet: '',
    role: 'client',
    numero_telephone: '',
    adresse: '',
    email: '',
    code_utilisateur: '',
    nif: '',
    rcs: '',
    stats: '',
};


export default function AuthPage() {
    const [registerData, setRegisterData] = useState(initialRegisterData);
    const [error, setError] = useState<string | null>(null);
    const [type_client, setType_client] = useState('particulier');
    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setRegisterData(prev => ({...prev, [name]: value}));
    };


    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const res: true | null = await authenticate(registerData as UserState, 'signup');
        if (!res) setError('Échec de l\'inscription, ressayez plus tard');
    };

    return (
        <div className="p-4 mx-auto">
            {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}

            <div className="w-full mx-auto max-w-4xl text-center  p-8">
                {/* Formulaire d'inscription */}
                <form onSubmit={handleRegisterSubmit} className="space-y-3 space-x-2">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#061e53]">Créer un compte</h2>

                    <input type="text" name="username" placeholder="Nom d'utilisateur" required
                           onChange={handleRegisterChange} className="input"/>
                    <input type="text" name="nom_complet" placeholder="Nom complet" required
                           onChange={handleRegisterChange} className="input"/>
                    <select name="type" value={type_client} onChange={(e) => {
                        setType_client(e.target.value);
                    }} className="input">
                        <option value="particulier">Particulier</option>
                        <option value="entreprise">Entreprise</option>
                    </select>
                    <input type="text" name="numero_telephone" placeholder="Téléphone" required
                           onChange={handleRegisterChange} className="input"/>
                    <input type="text" name="adresse" placeholder="Adresse" required onChange={handleRegisterChange}
                           className="input"/>
                    <input type="email" name="email" placeholder="Email" required onChange={handleRegisterChange}
                           className="input"/>


                    {/* Champs entreprise */}
                    {type_client === 'entreprise' && (
                        <>
                            <input type="text" name="nif" placeholder="NIF" onChange={handleRegisterChange}
                                   className="input"/>
                            <input type="text" name="rcs" placeholder="RCS" onChange={handleRegisterChange}
                                   className="input"/>
                            <input type="text" name="stats" placeholder="STAT" onChange={handleRegisterChange}
                                   className="input"/>
                        </>
                    )}
                    <br/>
                    <button type="submit" className="border border-[#061e53] text-[#061e53] px-6
                     py-3 rounded-full font-bold hover:bg-[#061e53] hover:text-white transition">S&#39;inscrire
                    </button>
                    <br/>
                    <Link href={'/se-connecter'}
                          className={'text-sm hover:underline hover:text-[#061e53]' +
                              ' transition-colors duration-300'}>Vous
                        avez déjà un compte ? Connectez-vous !</Link>
                </form>
            </div>
        </div>
    );
}
