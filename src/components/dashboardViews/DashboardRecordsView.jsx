import RecordsTable from '../table/RecordsTable';
import NoRecords from '../skeletons/NoRecords';
import TableSkeleton from '../skeletons/TableSkeleton';
import { Transition } from '@headlessui/react';
import SelectWeeklyViewWarning from './SelectWeeklyViewWarning';
import FetchError from '../skeletons/FetchError';

export default function DashboardRecordsView({
  records,
  userStatuses,
  selectedDate,
  setSelectedDate,
  apiStatus,
  selectedDateRange,
  setSelectedDateRange,
  setSelectedView,
  isDashboard,
}) {
  const { isLoading, isError, message } = apiStatus;
  const isNoRecords = Boolean(isLoading === false && records.length === 0);

  if (isError) return <FetchError />;

  return (
    <>
      {isNoRecords ? (
        <NoRecords />
      ) : selectedDateRange === 'week' ? (
        isLoading ? (
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
            <div className='flex flex-col rounded-xl border border-gray-200 bg-white pt-4'>
              <RecordsTable
                records={records}
                userStatuses={userStatuses}
                selectedDate={selectedDate}
                selectedDateRange={selectedDateRange}
                isDashboard={isDashboard}
              />
            </div>
          </Transition>
        )
      ) : (
        <SelectWeeklyViewWarning
          setSelectedDateRange={setSelectedDateRange}
          setSelectedDate={setSelectedDate}
        />
      )}
    </>
  );
}
