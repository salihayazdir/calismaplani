import { useState } from 'react';
import { RadioGroup } from '@headlessui/react';

const dashboardViews = [
  {
    name: 'İstatistikler',
    value: 'stats',
  },
  {
    name: 'Kayıtlar',
    value: 'records',
  },
  {
    name: 'Yöneticiler',
    value: 'managers',
  },
];

export default function DashboardViewRadio({ selected, setSelected }) {
  return (
    <div className='flex text-sm'>
      <RadioGroup value={selected} onChange={setSelected}>
        <div className='flex gap-2  rounded-lg bg-slate-600 p-1'>
          {dashboardViews.map((view) => (
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
