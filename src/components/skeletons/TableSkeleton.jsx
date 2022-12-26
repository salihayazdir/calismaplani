import { Transition } from '@headlessui/react';

export default function TableSkeleton() {
  return (
    <Transition
      appear={true}
      show={true}
      enter='transition-opacity duration-700'
      enterFrom='opacity-0'
      enterTo='opacity-100'
      leave='transition-opacity duration-500'
      leaveFrom='opacity-100'
      leaveTo='opacity-0'
    >
      <div
        role='status'
        className=' animate-pulse divide-y divide-gray-100 rounded-lg border border-gray-100 bg-white px-6'
      >
        <div className='flex items-center justify-between py-4'>
          <div>
            <div className='h-2.5 w-44 rounded-full bg-gray-200'></div>
          </div>
          <div className='flex gap-4'>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
          </div>
        </div>
        <div className='flex items-center justify-between py-4'>
          <div>
            <div className='h-2.5 w-44 rounded-full bg-gray-200'></div>
          </div>
          <div className='flex gap-4'>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
          </div>
        </div>
        <div className='flex items-center justify-between py-4'>
          <div>
            <div className='h-2.5 w-44 rounded-full bg-gray-200'></div>
          </div>
          <div className='flex gap-4'>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
          </div>
        </div>
        <div className='flex items-center justify-between py-4'>
          <div>
            <div className='h-2.5 w-44 rounded-full bg-gray-200'></div>
          </div>
          <div className='flex gap-4'>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
          </div>
        </div>
        <div className='flex items-center justify-between py-4'>
          <div>
            <div className='h-2.5 w-44 rounded-full bg-gray-200'></div>
          </div>
          <div className='flex gap-4'>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
          </div>
        </div>
        <div className='flex items-center justify-between py-4'>
          <div>
            <div className='h-2.5 w-44 rounded-full bg-gray-200'></div>
          </div>
          <div className='flex gap-4'>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
          </div>
        </div>
        <div className='flex items-center justify-between py-4'>
          <div>
            <div className='h-2.5 w-44 rounded-full bg-gray-200'></div>
          </div>
          <div className='flex gap-4'>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
          </div>
        </div>
        <div className='flex items-center justify-between py-4'>
          <div>
            <div className='h-2.5 w-44 rounded-full bg-gray-200'></div>
          </div>
          <div className='flex gap-4'>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
            <div className='h-3 w-16 rounded-full bg-gray-200'></div>
          </div>
        </div>

        <span className='sr-only'>Loading...</span>
      </div>
    </Transition>
  );
}
