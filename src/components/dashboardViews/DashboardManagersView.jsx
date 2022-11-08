import React from 'react';
import ManagerUserTable from '../table/ManagerUserTable';
import TableSkeleton from '../skeletons/TableSkeleton';
import { Transition } from '@headlessui/react';
import SelectWeeklyViewWarning from './SelectWeeklyViewWarning';

export default function DashboardManagersView({
  listOfUsers,
  records,
  apiStatus,
  selectedDate,
  selectedDateRange,
  setSelectedDateRange,
}) {
  return (
    <>
      {selectedDateRange === 'week' ? (
        apiStatus.isLoading ? (
          <TableSkeleton />
        ) : (
          <Transition
            appear={true}
            show={true}
            enter='transition-opacity duration-500'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='transition-opacity duration-500'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='flex flex-col rounded-xl border border-gray-200 bg-white py-4'>
              <ManagerUserTable
                listOfUsers={listOfUsers}
                records={records}
                selectedDate={selectedDate}
              />
            </div>
          </Transition>
        )
      ) : (
        <SelectWeeklyViewWarning setSelectedDateRange={setSelectedDateRange} />
      )}
    </>
  );
}
