import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import selectboxStatusStyles from '../../utils/selectboxStatusStyles';

export default function TableStatusSelect({
  selectedId,
  setNewRecords,
  userStatuses,
  username,
  day,
}) {
  const userStatusesWithEmpty = [
    { user_status_id: 0, user_status_name: 'Belirsiz' },
    ...userStatuses,
  ];

  const handleSelectOnChange = (value) => {
    setNewRecords((prev) => {
      const daysRecord = prev.filter((records) => records.dayIdx === day)[0];
      const otherRecords = prev.filter((records) => records.dayIdx !== day);

      const recordOwner = daysRecord.data.filter(
        (user) => user.username === username
      )[0];
      const restOfUsers = daysRecord.data.filter(
        (user) => user.username !== username
      );

      return [
        ...otherRecords,
        {
          ...daysRecord,
          data: [...restOfUsers, { ...recordOwner, user_status_id: value }],
        },
      ];
    });
  };

  return (
    <Listbox
      value={selectedId}
      onChange={handleSelectOnChange}
      as={'div'}
      className=' w-full'
    >
      <Listbox.Button
        className={`relative w-full cursor-pointer rounded-lg  border border-gray-200 bg-white py-1.5 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 
          ${selectboxStatusStyles(selectedId)} `}
      >
        <span className='block truncate'>
          {selectedId === 0
            ? 'Seçiniz'
            : userStatusesWithEmpty.filter(
                (status) => status.user_status_id === selectedId
              )[0].user_status_name}
        </span>
        <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
          <ChevronUpDownIcon
            className='h-5 w-5 text-gray-500'
            aria-hidden='true'
          />
        </span>
      </Listbox.Button>
      <Transition
        as={'div'}
        className='w-full'
        leave='transition ease-in duration-100'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <Listbox.Options className='absolute z-50 mt-1 max-h-60 w-1/12 min-w-[8rem] overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
          {userStatusesWithEmpty.map((status) => (
            <Listbox.Option
              key={status.user_status_id}
              className={({ active, selected }) =>
                `relative cursor-pointer select-none  py-2 px-3 ${
                  active ? 'bg-gray-50 text-gray-700' : 'text-gray-400'
                } ${selected && 'bg-slate-100'}`
              }
              value={status.user_status_id}
            >
              {({ selected }) => (
                <>
                  <span
                    className={`block truncate ${
                      selected ? 'font-bold text-gray-700' : 'font-normal'
                    }`}
                  >
                    {status.user_status_name}
                  </span>
                  {/* {selected ? (
                      <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700'>
                        <CheckIcon className='h-4 w-4' aria-hidden='true' />
                      </span>
                    ) : null} */}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
}
