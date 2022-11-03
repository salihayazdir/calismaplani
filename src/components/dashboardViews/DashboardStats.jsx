import DoughnutChart from '../charts/DoughnutChart';
import BarChart from '../charts/BarChart';
import DailyStats from '../charts/DailyStats';
import NoRecords from '../skeletons/NoRecords';
import Loader from '../skeletons/Loader';

export default function DashboardStats({
  records,
  apiStatus,
  userStatuses,
  selectedDate,
  selectedDateRange,
  setSelectedView,
}) {
  const { isLoading, isError, message } = apiStatus;
  const isNoRecords = Boolean(isLoading === false && records.length === 0);
  return (
    <>
      {isNoRecords ? (
        <NoRecords isDashboard setSelectedView={setSelectedView} />
      ) : isLoading ? (
        <Loader />
      ) : (
        <>
          {selectedDateRange === 'week' ? (
            <DailyStats
              records={records}
              userStatuses={userStatuses}
              selectedDate={selectedDate}
            />
          ) : null}

          <div className='flex justify-between gap-6 '>
            <div className='w-2/3 items-center justify-center rounded-lg border border-gray-200 bg-white'>
              <BarChart records={records} userStatuses={userStatuses} />
            </div>
            <div className='w-1/3 rounded-lg border border-gray-200 bg-white '>
              <DoughnutChart records={records} userStatuses={userStatuses} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
