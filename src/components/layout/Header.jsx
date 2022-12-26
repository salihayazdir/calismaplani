import React from 'react';
import Image from 'next/image';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import { useRouter } from 'next/router';
import { UserIcon } from '@heroicons/react/24/outline';

export default function Header({ displayName }) {
  const router = useRouter();

  const signOut = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/auth/logout`)
      .then((res) => router.push('/giris'))
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <header className='flex items-center justify-between border-b border-gray-200 bg-white py-3 px-10'>
      <Image
        src='/bilesimLogo.png'
        alt='Bileşim Logo'
        width='132'
        height='33'
      />
      <div className='flex overflow-hidden rounded-lg border border-gray-200 text-sm'>
        <div className=' inline-flex items-center gap-3 py-[6px] px-4 text-gray-600'>
          <UserIcon className='h-4 w-4' />
          <span>{displayName}</span>
        </div>
        <button
          onClick={signOut}
          className='flex gap-2 border-l border-gray-200 py-[6px] px-4 font-semibold hover:bg-gray-50 hover:text-red-500'
        >
          <span>Çıkış</span>
          <ArrowLeftOnRectangleIcon className='h-5 w-5' />
        </button>
      </div>
    </header>
  );
}
