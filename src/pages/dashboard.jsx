import { useEffect, useState } from 'react';
import axios from 'axios';
import verifyToken from '../backend/verifyToken';
import {
  startOfISOWeek,
  endOfISOWeek,
  addDays,
  format,
  endOfMonth,
  addMonths,
} from 'date-fns';
import { getUserStatuses, getUsersWithManagers } from '../database/dbOps';
import Layout from '../components/layout/Layout';
import DayPicker from '../components/datepickers/DayPicker';
import WeekPicker from '../components/datepickers/WeekPicker';
import MonthPicker from '../components/datepickers/MonthPicker';
import DateRangeRadio from '../components/radio/DateRangeRadio';
import ViewRadio from '../components/radio/ViewRadio';
import DashboardStatsView from '../components/dashboardViews/DashboardStatsView';
import DashboardManagersView from '../components/dashboardViews/DashboardManagersView';
import DashboardRecordsView from '../components/dashboardViews/DashboardRecordsView';
import {
  ArrowPathIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { addLog } from '../database/dbOps';

export default function Dashboard({ userStatuses, userData, listOfUsers }) {
  useEffect(() => {
    document.body.style.zoom = '90%';
  }, []);

  const [selectedDate, setSelectedDate] = useState(startOfISOWeek(new Date()));
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [selectedView, setSelectedView] = useState('stats');
  const [records, setRecords] = useState([]);
  const [apiStatus, setApiStatus] = useState({
    isLoading: true,
    isError: false,
    message: '',
  });

  const router = useRouter();
  const signOut = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/auth/logout`)
      .then((res) => router.push('/giris'))
      .catch((err) => {
        console.error(err);
      });
  };

  // useEffect(() => {
  //   if (apiStatus.isError !== false) signOut();
  // }, [apiStatus]);

  useEffect(() => {
    fetchTableData();
  }, [selectedDate, selectedDateRange]);

  const fetchTableData = () => {
    const startDate = format(selectedDate, 'yyyy-MM-dd');
    let endDate;

    if (selectedDateRange === 'month')
      endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
    if (selectedDateRange === 'week')
      endDate = format(addDays(selectedDate, 5), 'yyyy-MM-dd');
    if (selectedDateRange === 'day')
      endDate = format(selectedDate, 'yyyy-MM-dd');

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

  const views = [
    {
      name: 'Dashboard',
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

  const handleNextPrevDate = (action) => {
    const isNext = action === 'next';

    if (isNext) {
      if (selectedDateRange === 'month')
        setSelectedDate((prev) => addMonths(prev, 1));
      if (selectedDateRange === 'week')
        setSelectedDate((prev) => addDays(prev, 7));
      if (selectedDateRange === 'day')
        setSelectedDate((prev) => addDays(prev, 1));
    } else {
      if (selectedDateRange === 'month')
        setSelectedDate((prev) => addMonths(prev, -1));
      if (selectedDateRange === 'week')
        setSelectedDate((prev) => addDays(prev, -7));
      if (selectedDateRange === 'day')
        setSelectedDate((prev) => addDays(prev, -1));
    }
  };

  const nextDateButtonDisabled = Boolean(
    selectedDate > addDays(endOfISOWeek(new Date()), 13)
  );

  return (
    <>
      <Layout
        title='Çalışma Planı | Dashboard'
        displayName={userData.display_name}
      >
        <div className='flex  flex-col gap-6 px-10 py-6'>
          <div className='flex items-center justify-between'>
            <ViewRadio
              selected={selectedView}
              setSelected={setSelectedView}
              views={views}
              setSelectedDate={setSelectedDate}
            />
            <div className='flex gap-4'>
              <DateRangeRadio
                selectedDateRange={selectedDateRange}
                setSelectedDateRange={setSelectedDateRange}
                setSelectedDate={setSelectedDate}
              />
              <div className='flex rounded-lg border border-gray-200 bg-white'>
                <div className='flex w-16 items-center justify-center rounded-l-lg border-r text-center text-sm font-semibold text-gray-500'>
                  {selectedDateRange === 'day' ? 'Gün' : null}
                  {selectedDateRange === 'week' ? 'Hafta' : null}
                  {selectedDateRange === 'month' ? 'Ay' : null}
                </div>
                {selectedDateRange === 'day' ? (
                  <DayPicker
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    maxDate={addDays(endOfISOWeek(new Date()), 14)}
                  />
                ) : null}
                {selectedDateRange === 'week' ? (
                  <WeekPicker
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    maxDate={addDays(endOfISOWeek(new Date()), 14)}
                  />
                ) : null}
                {selectedDateRange === 'month' ? (
                  <MonthPicker
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    maxDate={addDays(endOfISOWeek(new Date()), 14)}
                  />
                ) : null}
              </div>

              <div className='flex items-stretch divide-x divide-gray-200 rounded-lg border border-gray-200 bg-white  '>
                <button
                  onClick={() => handleNextPrevDate('prev')}
                  className='flex w-10 items-center justify-center rounded-l-lg text-blue-600 hover:bg-blue-600 hover:text-white disabled:text-gray-300 disabled:hover:bg-white disabled:hover:text-gray-300'
                >
                  <ChevronLeftIcon className='h-4 w-4' />
                </button>
                <button
                  disabled={nextDateButtonDisabled}
                  onClick={() => handleNextPrevDate('next')}
                  className='flex w-10 items-center justify-center rounded-r-lg text-blue-600 hover:bg-blue-600 hover:text-white disabled:text-gray-300 disabled:hover:bg-white disabled:hover:text-gray-300'
                >
                  <ChevronRightIcon className='h-4 w-4' />
                </button>
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
            <DashboardStatsView
              records={records}
              apiStatus={apiStatus}
              userStatuses={userStatuses}
              selectedDate={selectedDate}
              selectedDateRange={selectedDateRange}
              setSelectedView={setSelectedView}
            />
          ) : null}
          {selectedView === 'records' ? (
            <DashboardRecordsView
              records={records}
              userStatuses={userStatuses}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              apiStatus={apiStatus}
              selectedDateRange={selectedDateRange}
              setSelectedDateRange={setSelectedDateRange}
              setSelectedView={setSelectedView}
              isDashboard={true}
              fetchTableData={fetchTableData}
            />
          ) : null}
          {selectedView === 'managers' ? (
            <DashboardManagersView
              listOfUsers={listOfUsers}
              records={records}
              apiStatus={apiStatus}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
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
  try {
    if (!context.req.headers.cookie) throw '/giris';

    const userData = await verifyToken(context.req.headers.cookie);
    if (!userData) throw '/giris';
    if (userData.is_hr !== true) throw '/';

    // const authorizedPersonnel = await (await getAuthorizedPersonnel()).result;
    const userStatuses = await getUserStatuses();
    const listOfUsers = await getUsersWithManagers();

    if (!userStatuses || !listOfUsers) throw 'DB Error';

    return {
      props: { userStatuses, userData, listOfUsers },
    };
  } catch (err) {
    console.error(err);
    if (err === '/giris' || err === '/' || err === '/dashboard')
      return {
        redirect: {
          permanent: false,
          destination: err,
        },
      };
    else {
      const userData = await verifyToken(context.req.headers.cookie);
      addLog({
        type: 'props',
        isError: true,
        username: userData.username ? userData.username : null,
        info: `/dashboard ${err}`,
      });

      return {
        redirect: {
          permanent: false,
          destination: '/500',
        },
      };
    }
  }
}
