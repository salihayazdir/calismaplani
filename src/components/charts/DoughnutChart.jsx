import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ records, userStatuses }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    getDoughnutChartData(records);
  }, [records]);

  const getDoughnutChartData = (records) => {
    setChartData(
      userStatuses.map((status) => {
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
      })
    );
  };

  const statusLabels = chartData.map((status) => status.user_status_name);
  const statusCounts = chartData.map((status) => status.count);
  const recordCount = chartData.reduce((acc, status) => acc + status.count, 0);

  const data = {
    labels: statusLabels,
    datasets: [
      {
        label: 'Personel Statüleri',
        data: statusCounts,
        backgroundColor: ['#dcfce7', '#e0f2fe', '#fef9c3', '#fee2e2'],
        borderColor: ['#22c55e', '#0ea5e9', '#eab308', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <div className='flex flex-col items-center gap-4 border-b  border-gray-200 p-4 text-xs text-gray-700'>
        <div className='flex items-center rounded-md border border-gray-200 text-center text-sm font-semibold'>
          <span className='pl-4 pr-1 '>Toplam Kayıt</span>
          <span className='ml-2 rounded-md bg-gray-600 py-1 px-3 font-semibold tracking-wider text-gray-100'>
            {recordCount}
          </span>
        </div>
        <ul className='grid w-full grid-cols-2 gap-x-4 gap-y-2'>
          {chartData.map((status) => {
            return (
              <li
                key={status.user_status_id}
                className='flex items-center justify-between rounded-md border border-gray-200 pl-2'
              >
                <div className='py-1'>{status.user_status_name}</div>
                <div className='ml-2 flex overflow-hidden rounded-md font-semibold tracking-wider '>
                  <div className=' whitespace-nowrap bg-gray-600 px-3 py-1 text-gray-100'>
                    {status.count}
                  </div>
                  <div className='whitespace-nowrap bg-gray-100 px-2 py-1 text-gray-600'>{`% ${(
                    (100 * status.count) /
                    recordCount
                  ).toFixed(1)}`}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className='p-4'>
        <Doughnut data={data} />
      </div>
    </>
  );
}
