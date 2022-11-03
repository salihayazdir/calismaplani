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
      return records.reduce((acc, record) => {
        if (
          record.description === description &&
          record.user_status_id === status.user_status_id
        )
          return acc + 1;
        return acc;
      }, 0);
    });
    const statusColors = ['#dcfce7', '#e0f2fe', '#fef9c3', '#fee2e2'];

    return {
      label: status.user_status_name,
      data,
      backgroundColor: statusColors[idx],
      stack: `Stack ${idx}`,
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
      <div className='border-b border-gray-200 py-2 px-4 font-semibold'>
        Bölümler
      </div>
      <div className='p-4 pt-10'>
        <Bar options={options} data={data} />
      </div>
    </>
  );
}
