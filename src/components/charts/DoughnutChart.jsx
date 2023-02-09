import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { chartStatusColors } from '../../utils/chartStatusColors.';
import getChartStatusColors from '../../utils/chartStatusColors.';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ records, userStatuses }) {
  const chartData = userStatuses.map((status) => {
    const count = records.reduce(
      (acc, record) =>
        acc + Boolean(record.user_status_id === status.user_status_id),
      0
    );
    return {
      user_status_id: status.user_status_id,
      user_status_name: status.user_status_name,
      count,
    };
  });
  // .filter((status) => status.count !== 0);

  const statusLabels = chartData.map((status) => status.user_status_name);
  const statusCounts = chartData.map((status) => status.count);
  const recordCount = chartData.reduce((acc, status) => acc + status.count, 0);

  const data = {
    labels: statusLabels,
    datasets: [
      {
        label: 'Personel Statüleri',
        data: statusCounts,
        backgroundColor: chartStatusColors,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <>
      <div className='flex flex-col'>
        <div className='flex items-center justify-between border-b border-gray-200 py-2 px-4 text-center font-semibold'>
          <div className=''>Tüm Kayıtlar</div>
          <div className='inline-flex items-center gap-2 text-sm font-medium text-gray-300'>
            <span className=''>Toplam:</span>
            <span className=''>{recordCount}</span>
          </div>
        </div>
        <ul className='flex w-full flex-col gap-2 border-b  border-gray-200 p-4 text-xs text-gray-700'>
          {chartData.map((status) => {
            if (status.count === 0) return;
            console.log(
              `w-16 whitespace-nowrap bg-[${getChartStatusColors(
                status.user_status_id
              )}] px-2 py-1 text-center text-white`
            );
            return (
              <li
                key={status.user_status_id}
                className='flex items-center justify-between rounded-md border border-gray-200 pl-2'
              >
                <div className='flex items-center gap-4 py-1'>
                  <span>{status.user_status_name}</span>
                  <div
                    className={`h-2.5 w-6 rounded-md bg-[${getChartStatusColors(
                      status.user_status_id
                    )}] `}
                  ></div>
                </div>
                <div className='ml-2 flex overflow-hidden rounded-md font-semibold tracking-wider '>
                  <div className=' whitespace-nowrap bg-gray-100 px-3 py-1 text-gray-600'>
                    {status.count}
                  </div>
                  <div
                    className={`w-16 whitespace-nowrap bg-gray-600 px-2 py-1 text-center text-white`}
                  >{`% ${((100 * status.count) / recordCount).toFixed(
                    1
                  )}`}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className=' p-[5%]'>
        <Doughnut data={data} options={options} />
      </div>
    </>
  );
}
