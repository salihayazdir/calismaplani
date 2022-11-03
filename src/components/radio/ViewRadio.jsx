import { RadioGroup } from '@headlessui/react';
import { startOfISOWeek, addDays } from 'date-fns';

export default function ViewRadio({
  selected,
  setSelected,
  views,
  setSelectedDate,
}) {
  const handleOnChange = (value) => {
    setSelected(value);
    if (value === 'newrecord')
      setSelectedDate(startOfISOWeek(addDays(new Date(), 7)));
  };

  return (
    <div className='flex text-sm'>
      <RadioGroup value={selected} onChange={handleOnChange}>
        <div className='flex gap-2  rounded-lg bg-slate-600 p-1'>
          {views.map((view) => (
            <RadioGroup.Option
              key={view.value}
              value={view.value}
              className={({ active, checked }) =>
                `${
                  checked
                    ? 'bg-slate-50 text-gray-700'
                    : 'text-slate-300 hover:bg-slate-500 hover:text-slate-100'
                }
                    relative flex cursor-pointer rounded-lg py-1 px-4 font-medium shadow-xl focus:outline-none`
              }
            >
              {({ active, checked }) => (
                <>
                  <div className='flex w-full items-center justify-between'>
                    <RadioGroup.Label as='p'>{view.name}</RadioGroup.Label>
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
