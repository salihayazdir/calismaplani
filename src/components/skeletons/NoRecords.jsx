import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function NoRecords() {
  return (
    <div className='flex w-full flex-col items-center justify-center gap-8 p-6 text-center'>
      <div className='inline-flex items-center justify-center gap-4 text-center text-lg font-medium text-gray-400'>
        <ExclamationCircleIcon className='h-8 w-8 text-orange-500' />
        <div>
          <span>Seçilen tarih aralığı için</span>
          <span className=' text-orange-500'>{` kayıt bulunamadı.`}</span>
        </div>
      </div>
    </div>
  );
}
