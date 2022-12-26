import { RadioGroup } from '@headlessui/react';
import { startOfMonth, startOfISOWeek, addDays } from 'date-fns';

const ranges = [
  {
    name: 'Günlük',
    value: 'day',
  },
  {
    name: 'Haftalık',
    value: 'week',
  },
  {
    name: 'Aylık',
    value: 'month',
  },
];

export default function DateRangeRadio({
  selectedDateRange,
  setSelectedDateRange,
  setSelectedDate,
}) {
  const handleOnChange = (value) => {
    setSelectedDateRange(value);
    setSelectedDate((prevDate) => {
      if (value === 'month') return startOfMonth(prevDate);
      if (value === 'week') return startOfISOWeek(addDays(prevDate, 2));
      return prevDate;
    });
  };

  return (
    <div className='flex text-sm'>
      <RadioGroup
        value={selectedDateRange}
        onChange={(value) => handleOnChange(value)}
      >
        <div className='flex gap-1 rounded-lg border border-gray-200 bg-white p-1'>
          {ranges.map((range) => (
            <RadioGroup.Option
              key={range.value}
              value={range.value}
              className={({ active, checked }) =>
                `${
                  checked
                    ? 'bg-slate-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-100  hover:text-gray-500 '
                }
                    relative flex cursor-pointer rounded-lg py-1 px-4 font-medium  focus:outline-none`
              }
            >
              {({ active, checked }) => (
                <>
                  <div className='flex w-full items-center justify-between'>
                    <RadioGroup.Label as='p'>{range.name}</RadioGroup.Label>
                  </div>
                </>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
