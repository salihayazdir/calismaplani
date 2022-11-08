import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function SelectWeeklyViewWarning({ setSelectedDateRange }) {
  return (
    <div className='inline-flex items-center justify-center gap-4 py-6 text-center text-lg font-medium text-gray-400'>
      <ExclamationCircleIcon className='h-8 w-8' />
      <div>
        <span>Bu ekranı görüntülemek için</span>
        <span
          onClick={() => setSelectedDateRange('week')}
          className='cursor-pointer rounded-md py-1 text-blue-600 hover:mx-2 hover:bg-blue-100 hover:px-2 '
        >
          {` haftalık `}
        </span>
        <span>görünüm seçmelisiniz.</span>
      </div>
    </div>
  );
}
