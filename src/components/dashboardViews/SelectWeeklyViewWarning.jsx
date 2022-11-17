import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { startOfISOWeek } from 'date-fns';

export default function SelectWeeklyViewWarning({
  setSelectedDateRange,
  setSelectedDate,
}) {
  const handleViewChange = () => {
    setSelectedDate((prev) => startOfISOWeek(prev));
    setSelectedDateRange('week');
  };
  return (
    <div className='inline-flex items-center justify-center gap-4 py-6 text-center text-lg font-medium text-gray-400'>
      <ExclamationCircleIcon className='h-8 w-8' />
      <div>
        <span>Bu ekranı görüntülemek için</span>
        <span
          onClick={handleViewChange}
          className='cursor-pointer rounded-md py-1 text-blue-600 hover:mx-2 hover:bg-blue-100 hover:px-2 '
        >
          {` haftalık `}
        </span>
        <span>görünüm seçmelisiniz.</span>
      </div>
    </div>
  );
}
