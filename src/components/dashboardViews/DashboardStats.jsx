import DoughnutChart from '../charts/DoughnutChart';
import BarChart from '../charts/BarChart';

export default function DashboardStats({ records, userStatuses }) {
  return (
    <>
      <div className='flex justify-between gap-6 '>
        <div className='w-2/3 items-center justify-center rounded-lg border border-gray-200 bg-white'>
          <BarChart records={records} userStatuses={userStatuses} />
        </div>
        <div className='w-1/3 rounded-lg border border-gray-200 bg-white '>
          <DoughnutChart records={records} userStatuses={userStatuses} />
        </div>
      </div>
    </>
  );
}
