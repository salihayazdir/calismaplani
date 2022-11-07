import { Transition } from '@headlessui/react';

export default function GraphsSkeleton() {
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
        className='animate-pulse space-y-4 divide-y divide-gray-100 rounded-lg border border-gray-100 bg-white p-6'
      >
        <div className='flex items-baseline space-x-6'>
          <div className='h-72 w-full rounded-lg bg-gray-200'></div>
          <div className='h-56 w-full rounded-lg bg-gray-200'></div>
          <div className='h-24 w-full rounded-lg bg-gray-200'></div>
          <div className='h-64 w-full rounded-lg bg-gray-200'></div>
          <div className=' h-72 w-full rounded-lg bg-gray-200'></div>
          <div className='h-52 w-full rounded-lg bg-gray-200'></div>
          <div className='h-80 w-full rounded-lg bg-gray-200'></div>
          <div className='h-72 w-full rounded-lg bg-gray-200'></div>
          <div className='h-56 w-full rounded-lg bg-gray-200'></div>
        </div>
        <span className='sr-only'>Loading...</span>
      </div>
    </Transition>
  );
}
