import React from 'react';

export default function PageError() {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-10 pt-40'>
      <span className='text-5xl font-bold text-red-500'>404</span>
      <span className='text-3xl font-medium text-gray-600'>
        Sayfa Bulunamadı
      </span>
    </div>
  );
}
