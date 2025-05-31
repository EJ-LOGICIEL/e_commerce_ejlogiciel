'use client';
import React, {useState} from "react";
import {authenticate} from "@/lib/auth";
import {loginData} from "@/utils/types";
import Link from "next/link";

const initialLoginData: loginData = {
    username: '',
    password: '',
};

function Page() {
    const [loginForm, setLoginForm] = useState(initialLoginData);
    const [error, setError] = useState<string | null>(null);
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const res = await authenticate(loginForm, 'token');
        if (!res) setError('nom ou mot de passe incorrect');
    };


    return (

        <div className="p-4 mx-auto">
            {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}

            <div className="w-full mx-auto max-w-4xl text-center p-8">

                {/* Formulaire de connexion */}
                <form onSubmit={handleLoginSubmit} className="space-y-3 space-x-2">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#061e53]">Se connecter</h2>
                    <input type="text" name="username" placeholder="Nom d'utilisateur" required
                           onChange={(e) => {
                               setLoginForm(prev => ({...prev, username: e.target.value}));
                           }} className="input"/>
                    <input type="password" name="password" placeholder="Mot de passe" required
                           onChange={(e) => {
                               setLoginForm(prev => ({...prev, password: e.target.value}));
                           }} className="input"/>

                    <br/>
                    <button type="submit" className="border border-[#061e53] text-[#061e53] px-6
                     py-3 rounded-full font-bold hover:bg-[#061e53] hover:text-white transition">Se connecter
                    </button>
                    <br/>
                    <Link href={'/inscription'}
                          className={'text-sm hover:underline hover:text-[#061e53]' +
                              ' transition-colors duration-300'}>Nouveau ? Inscrivez-vous !</Link>
                </form>
            </div>
        </div>
    );
}

export default Page;