import DoughnutChart from '../charts/DoughnutChart';
import BarChart from '../charts/BarChart';
import DailyStats from '../charts/DailyStats';
import NoRecords from '../skeletons/NoRecords';
import TableSkeleton from '../skeletons/TableSkeleton';
import GraphsSkeleton from '../skeletons/GraphsSkeleton';
import { Transition } from '@headlessui/react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import UpdateUsersModal from '../modals/UpdateUsersModal';
import exportStats from '../../utils/exportStats';
import FetchError from '../skeletons/FetchError';

export default function DashboardStatsView({
  records,
  apiStatus,
  userStatuses,
  selectedDate,
  selectedDateRange,
  setSelectedView,
}) {
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false);

  const { isLoading, isError, message } = apiStatus;
  const isNoRecords = Boolean(isLoading === false && records.length === 0);

  const handleExportButton = () =>
    exportStats({
      records,
      userStatuses,
      selectedDateRange,
      selectedDate,
    });

  if (isError) return <FetchError />;

  return (
    <>
      <div className='-mx-10 -mt-8 mb-2 flex items-center justify-between border-b border-gray-200  py-3 px-10 shadow-gray-200'>
        <h2></h2>
        <div className='flex gap-4'>
          <button
            onClick={() => setUpdateModalIsOpen(true)}
            className='rounded-lg px-4 py-2 text-center text-sm font-medium text-gray-400 hover:bg-orange-100 hover:text-orange-600 '
          >
            Kullanıcıları Güncelle
          </button>

          {isNoRecords === false ? (
            <button
              onClick={handleExportButton}
              className='flex-end inline-flex gap-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-800'
            >
              <span>{"Excel'e Aktar"}</span>
              <span>
                <ArrowDownTrayIcon className='h-5 w-5' />
              </span>
            </button>
          ) : null}
        </div>
      </div>
      {isNoRecords ? (
        <NoRecords />
      ) : isLoading ? (
        <div className='flex gap-6'>
          <div className='flex-1'>
            <GraphsSkeleton />
          </div>
          <div className='flex-1'>
            <TableSkeleton />
          </div>
        </div>
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
          <div className='flex flex-col gap-10'>
            {selectedDateRange === 'week' ? (
              <DailyStats
                records={records}
                userStatuses={userStatuses}
                selectedDate={selectedDate}
              />
            ) : null}

            <div className='flex justify-between gap-6 '>
              <div className=' w-1/5 rounded-lg border border-gray-200 bg-white '>
                <DoughnutChart records={records} userStatuses={userStatuses} />
              </div>
              <div className='w-4/5 items-center justify-center rounded-lg border border-gray-200 bg-white'>
                <BarChart records={records} userStatuses={userStatuses} />
              </div>
            </div>
          </div>
        </Transition>
      )}

      {updateModalIsOpen ? (
        <UpdateUsersModal
          isOpen={updateModalIsOpen}
          setIsOpen={setUpdateModalIsOpen}
        />
      ) : null}
    </>
  );
}
