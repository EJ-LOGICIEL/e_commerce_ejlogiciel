import Link from 'next/link';
import {FiHome, FiPackage} from 'react-icons/fi';
import {RiAccountCircle2Line} from 'react-icons/ri';

function Footer() {
  return (
    <div className={'flex justify-around border-t bg-[#061e53] text-white border-gray-200 p-3'}>
      <Link href='/'>
        <FiHome className='mr-2 inline-block' />
        Accueil
      </Link>

      <Link href='/produit'>
        <FiPackage className='mr-2 inline-block' />
        Produits
      </Link>
      <Link href='/compte'>
        <RiAccountCircle2Line className='mr-2 inline-block' />
        Mon compte
      </Link>
    </div>
  );
}

export default Footer;
