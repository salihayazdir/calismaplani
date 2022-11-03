import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

export default function NewRecordBulkActions({
  setNewRecords,
  userStatuses,
  selectedFlatRows,
  numberOfSelectedRows,
  toggleAllRowsSelected,
}) {
  const [selectedStatus, setSelectedStatus] = useState(userStatuses[0]);

  const applyBulkStatus = () => {
    toggleAllRowsSelected(false);

    const usersToApplyBulkAction = selectedFlatRows.map(
      (row) => row.values.username
    );

    setNewRecords((prevRecords) =>
      prevRecords.map((dayOfRecords) => {
        const recordsOfSelectedUsers = dayOfRecords.data.filter((record) =>
          usersToApplyBulkAction.includes(record.username)
        );
        const recordsOfOtherUsers = dayOfRecords.data.filter(
          (record) => !usersToApplyBulkAction.includes(record.username)
        );

        const modifiedRecords = recordsOfSelectedUsers.map((record) => ({
          ...record,
          user_status_id: selectedStatus.user_status_id,
        }));

        return {
          ...dayOfRecords,
          data: [...recordsOfOtherUsers, ...modifiedRecords],
        };
      })
    );
  };

  return (
    <div className='flex w-full justify-end gap-2 text-xs'>
      <div className='w-40'>
        <Listbox value={selectedStatus} onChange={setSelectedStatus}>
          <div className='relative'>
            <Listbox.Button className='relative w-full cursor-default rounded-lg border border-gray-200 bg-gray-50  py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300'>
              <span className='block truncate'>
                {selectedStatus.user_status_name}
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
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                      }`
                    }
                    value={status}
                  >
                    {({ selectedStatus }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selectedStatus
                              ? 'font-medium text-blue-700'
                              : 'font-normal'
                          }`}
                        >
                          {status.user_status_name}
                        </span>
                        {selectedStatus ? (
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
      </div>
      <button
        onClick={applyBulkStatus}
        disabled={numberOfSelectedRows === 0}
        className='rounded-lg bg-gray-700 py-2 px-4 font-semibold text-white disabled:bg-gray-300'
      >
        {numberOfSelectedRows === 0
          ? 'Uygula'
          : `Uygula (${numberOfSelectedRows})`}
      </button>
    </div>
  );
}
