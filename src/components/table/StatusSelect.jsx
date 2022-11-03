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
      <div className='relative min-w-[7rem]'>
        <Listbox.Button className='relative w-full cursor-pointer rounded-lg  bg-white py-2 pl-3 pr-10 text-left shadow focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300'>
          <span className='block truncate'>
            {
              userStatuses.filter(
                (status) => status.user_status_id === selectedId
              )[0].user_status_name
            }
          </span>
          <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
            <ChevronUpDownIcon
              className='h-5 w-5 text-gray-400'
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
                className={({ active }) =>
                  `relative cursor-pointer select-none  py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                  }`
                }
                value={status.user_status_id}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium text-blue-700' : 'font-normal'
                      }`}
                    >
                      {status.user_status_name}
                    </span>
                    {selected ? (
                      <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-blue-700'>
                        <CheckIcon className='h-5 w-5' aria-hidden='true' />
                      </span>
                    ) : null}
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
