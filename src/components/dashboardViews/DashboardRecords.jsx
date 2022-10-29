import RecordsTable from '../table/RecordsTable';
import Loader from '../Loader';

export default function DashboardRecords({
  records,
  userStatuses,
  selectedDate,
  apiStatus,
}) {
  return (
    <>
      <div className='flex flex-col rounded-xl border border-gray-200 bg-white py-4'>
        {apiStatus.isLoading ? (
          <Loader />
        ) : (
          <RecordsTable
            records={records}
            userStatuses={userStatuses}
            selectedDate={selectedDate}
          />
        )}
      </div>
    </>
  );
}
