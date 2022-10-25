import { Popover, Transition } from '@headlessui/react';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';

export default function UserInfo() {
  return (
    <div className='flex overflow-hidden rounded-lg border border-gray-200 text-sm'>
      <span className='px-4  py-[6px] text-gray-600'>Salih Ayazdır</span>
      <div className='flex cursor-pointer gap-2 border-l border-gray-200 py-[6px] px-4 font-semibold hover:bg-gray-50 hover:text-red-500'>
        <span>Çıkış</span>
        <ArrowLeftOnRectangleIcon className='h-5 w-5' />
      </div>
    </div>
  );
}
