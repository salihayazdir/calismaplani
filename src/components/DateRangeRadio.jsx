import { useState } from 'react';
import { RadioGroup } from '@headlessui/react';

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

export default function DateRangeRadio({ selected, setSelected }) {
  return (
    <div className='flex text-sm'>
      <RadioGroup value={selected} onChange={setSelected}>
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

function CheckIcon(props) {
  return (
    <svg viewBox='0 0 24 24' fill='none' {...props}>
      <circle cx={12} cy={12} r={12} fill='#fff' opacity='0.2' />
      <path
        d='M7 13l3 3 7-7'
        stroke='#fff'
        strokeWidth={1.5}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
