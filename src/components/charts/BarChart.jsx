import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChart({ records, userStatuses }) {
  const descriptions = [
    ...new Set(records.map((record) => record.description)),
  ];

  const datasets = userStatuses.map((status, idx) => {
    const data = descriptions.map((description, idx) => {
      const divisionTotal = records.reduce((acc, record) => {
        if (record.description === description) return acc + 1;
        return acc;
      }, 0);

      const statusCount = records.reduce((acc, record) => {
        if (
          record.description === description &&
          record.user_status_id === status.user_status_id
        )
          return acc + 1;
        return acc;
      }, 0);

      return ((statusCount * 100) / divisionTotal).toFixed(1);
    });

    const statusColors = ['#22c55e', '#3b82f6', '#facc15', '#ef4444'];
    // const statusColors = [
    //   '#22c55e',
    //   '#3b82f6',
    //   '#facc15',
    //   '#f97316',
    //   '#f97316',
    //   '#f97316',
    //   '#a21caf',
    //   '#f97316',
    //   '#ec4899',
    //   '#ef4444',
    //   '#ef4444',
    // ];

    return {
      label: status.user_status_name,
      data,
      backgroundColor: idx < 4 ? statusColors[idx] : statusColors[3],
      // backgroundColor: statusColors[idx],
      borderRadius: 3,
      stack: idx < 4 ? `Stack ${idx}` : `Stack 3`,
    };
  });

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  const data = {
    labels: descriptions,
    datasets,
  };

  return (
    <>
      <div className='flex justify-between border-b border-gray-200 py-2 px-4 font-semibold'>
        <span>Bölümler</span>
        <span className='ml-2 text-gray-400'>{`% Yüzdelik Veri`}</span>
      </div>
      <div className='p-4'>
        <Bar options={options} data={data} />
      </div>
    </>
  );
}
