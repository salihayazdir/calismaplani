import { SignalSlashIcon } from '@heroicons/react/24/outline';

export default function FetchError() {
  return (
    <div className='flex w-full flex-col items-center justify-center gap-8 p-6 text-center'>
      <div className='relative inline-flex items-center justify-center gap-4 text-center text-lg font-medium text-gray-400'>
        <SignalSlashIcon className='absolute top-10 h-64 w-64 text-red-300 opacity-25' />
        <div>Kayıtlar Yüklenemedi</div>
      </div>
    </div>
  );
}
