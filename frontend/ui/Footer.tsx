'use client';
import Link from 'next/link';
import {FiHome, FiPackage} from 'react-icons/fi';
import {RiAccountCircle2Line} from 'react-icons/ri';
import {UserState} from "@/utils/types";
import {useSelector} from "react-redux";
import {selectCurrentUser} from "@/features/user/userSlice";

function Footer() {
    const user: UserState | null = useSelector(selectCurrentUser)
    return (
        <div className={'flex justify-around border-t bg-[#061e53] text-white border-gray-200 p-3'}>
            <Link href='/'>
                <FiHome className='mr-2 inline-block'/>
                Accueil
            </Link>

            <Link href='/produits'>
                <FiPackage className='mr-2 inline-block'/>
                Produits
            </Link>
            <Link href={!user ? '/se-connecter' : '/mon-compte'}>
                <RiAccountCircle2Line className='mr-2 inline-block'/>
                Mon compte
            </Link>
        </div>
    );
}

export default Footer;
