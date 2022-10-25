import React from 'react';
import UserInfo from './UserInfo';
import Image from 'next/image';

export default function Header() {
  return (
    <header className='flex items-center justify-between border-b border-gray-200 bg-white py-3 px-10'>
      <Image
        src='/bilesimLogo.png'
        alt='Bileşim Logo'
        width='132'
        height='33'
      />
      <UserInfo />
    </header>
  );
}
