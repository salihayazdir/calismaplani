import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

export default function StatusSelect({
  selectedId,
  setNewRecords,
  userStatuses,
  username,
  day,
}) {
  const getStatusStyles = (statusId) => {
    switch (statusId) {
      case 1:
        return 'bg-green-50 text-green-700 border border-green-300';
        break;
      case 2:
        return 'bg-sky-50 text-sky-700 border border-sky-300';
        break;
      case 3:
        return 'bg-yellow-50 text-yellow-700 border border-yellow-300';
        break;
      default:
        return 'bg-red-50 text-red-700 border border-red-300';
    }
  };

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
    <Listbox value={selectedId} onChange={handleSelectOnChange}>
      <div className='absolute -mt-3.5 min-w-[7rem] text-gray-600'>
        <Listbox.Button
          className={`relative w-32 cursor-pointer rounded-lg  bg-white py-1.5 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 
          ${getStatusStyles(selectedId)} `}
        >
          <span className='block truncate'>
            {
              userStatuses.filter(
                (status) => status.user_status_id === selectedId
              )[0].user_status_name
            }
          </span>
          <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
            <ChevronUpDownIcon
              className='h-5 w-5 text-gray-500'
              aria-hidden='true'
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave='transition ease-in duration-100'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <Listbox.Options className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
            {userStatuses.map((status) => (
              <Listbox.Option
                key={status.user_status_id}
                className={({ active, selected }) =>
                  `relative cursor-pointer select-none  py-2 px-4 ${
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
      </div>
    </Listbox>
  );
}
