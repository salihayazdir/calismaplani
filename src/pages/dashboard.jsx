import { useEffect, useState } from 'react';
import axios from 'axios';
import verifyToken from '../backend/verifyToken';
import { startOfISOWeek, addDays, format, endOfMonth } from 'date-fns';
import { getUserStatuses, getUsersWithManagers } from '../database/dbOps';
import Layout from '../components/layout/Layout';
import WeekPicker from '../components/datepickers/WeekPicker';
import DateRangeRadio from '../components/radio/DateRangeRadio';
import ViewRadio from '../components/radio/ViewRadio';
import DashboardStats from '../components/dashboardViews/DashboardStats';
import DashboardManagers from '../components/dashboardViews/DashboardManagers';
import DashboardRecords from '../components/dashboardViews/DashboardRecords';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import MonthPicker from '../components/datepickers/MonthPicker';

export default function Dashboard({ userStatuses, userData, listOfUsers }) {
  const [selectedDate, setSelectedDate] = useState(startOfISOWeek(new Date()));
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [selectedView, setSelectedView] = useState('stats');
  const [records, setRecords] = useState([]);
  const [apiStatus, setApiStatus] = useState({
    isLoading: true,
    isError: false,
    message: '',
  });

  const fetchTableData = () => {
    const startDate = format(selectedDate, 'yyyy-MM-dd');

    let endDate;

    if (selectedDateRange === 'month') {
      endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
    } else {
      endDate = format(addDays(selectedDate, 5), 'yyyy-MM-dd');
    }

    setApiStatus({
      isLoading: true,
      isError: false,
      message: '',
    });

    axios
      .post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/records/get-all-records`, {
        startDate: startDate,
        endDate: endDate,
      })
      .then((res) => {
        if (res.data.success === true) {
          setRecords(res.data.records);
          setApiStatus({
            isLoading: false,
            isError: false,
            message: res.data.message || '',
          });
        } else {
          setApiStatus({
            isLoading: false,
            isError: true,
            message: res.data.message || 'Bağlantı hatası.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setApiStatus({
          isLoading: false,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  useEffect(() => {
    fetchTableData();
  }, [selectedDate, selectedDateRange]);

  const views = [
    {
      name: 'İstatistikler',
      value: 'stats',
    },
    {
      name: 'Kayıtlar',
      value: 'records',
    },
    {
      name: 'Yöneticiler',
      value: 'managers',
    },
  ];

  return (
    <>
      <Layout title='PDKS | Dashboard' displayName={userData.display_name}>
        <div className='flex  flex-col gap-6 px-10 py-6'>
          <div className='flex items-center justify-between'>
            <ViewRadio
              selected={selectedView}
              setSelected={setSelectedView}
              views={views}
            />
            <div className='flex gap-4'>
              <DateRangeRadio
                selectedDateRange={selectedDateRange}
                setSelectedDateRange={setSelectedDateRange}
                setSelectedDate={setSelectedDate}
              />
              <div className='flex rounded-lg border border-gray-200 bg-white'>
                <div className='flex w-16 items-center justify-center rounded-l-lg border-r text-center text-sm font-semibold text-gray-500'>
                  {selectedDateRange === 'month' ? 'Ay' : 'Hafta'}
                </div>
                {selectedDateRange === 'week' ? (
                  <WeekPicker
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                  />
                ) : null}
                {selectedDateRange === 'month' ? (
                  <MonthPicker
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                  />
                ) : null}
              </div>
              <button
                onClick={() => fetchTableData()}
                type='button'
                className='flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-400 hover:text-green-600 '
              >
                <ArrowPathIcon className='h-5 w-5' />
              </button>
            </div>
          </div>
          <hr className=' -mx-10 pb-2 text-gray-200' />
          {selectedView === 'stats' ? (
            <DashboardStats
              records={records}
              apiStatus={apiStatus}
              userStatuses={userStatuses}
              selectedDate={selectedDate}
              selectedDateRange={selectedDateRange}
              setSelectedView={setSelectedView}
            />
          ) : null}
          {selectedView === 'records' ? (
            <DashboardRecords
              records={records}
              userStatuses={userStatuses}
              selectedDate={selectedDate}
              apiStatus={apiStatus}
              selectedDateRange={selectedDateRange}
              setSelectedDateRange={setSelectedDateRange}
              setSelectedView={setSelectedView}
              isDashboard={true}
            />
          ) : null}
          {selectedView === 'managers' ? (
            <DashboardManagers
              listOfUsers={listOfUsers}
              records={records}
              apiStatus={apiStatus}
              selectedDate={selectedDate}
              selectedDateRange={selectedDateRange}
              setSelectedDateRange={setSelectedDateRange}
            />
          ) : null}
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps(context) {
  if (!context.req.headers.cookie)
    return {
      redirect: {
        permanent: false,
        destination: '/giris',
      },
      props: {},
    };

  const userData = await verifyToken(context.req.headers.cookie);
  console.log(userData);

  if (!userData)
    return {
      redirect: {
        permanent: false,
        destination: '/giris',
      },
      props: {},
    };

  if (userData.is_hr === false)
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
      props: {},
    };

  const userStatuses = await getUserStatuses();
  const listOfUsers = await getUsersWithManagers();

  return {
    props: { userStatuses, userData, listOfUsers },
  };
}
