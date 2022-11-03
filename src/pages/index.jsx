import { useState, useEffect } from 'react';
import axios from 'axios';
import verifyToken from '../backend/verifyToken';
import { getDirectReports, getUserStatuses } from '../database/dbOps';
import NewRecordTable from '../components/table/NewRecordTable';
import { startOfISOWeek, addDays, format } from 'date-fns';
import Layout from '../components/layout/Layout';
import WeekPicker from '../components/datepickers/WeekPicker';
import NewRecordsModal from '../components/modals/NewRecordsModal';
import DashboardRecords from '../components/dashboardViews/DashboardRecords';
import ViewRadio from '../components/radio/ViewRadio';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Home({ directReports, userStatuses, userData }) {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  const [selectedDate, setSelectedDate] = useState(
    startOfISOWeek(addDays(new Date(), 7))
  );
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedView, setSelectedView] = useState('newrecord');
  const [records, setRecords] = useState([]);
  const [apiStatus, setApiStatus] = useState({
    isLoading: true,
    isError: false,
    message: '',
  });

  const [newRecords, setNewRecords] = useState(
    days.map((day, dayIdx) => ({
      dayIdx,
      dayDisplayName: day,
      data: directReports.map((user) => ({
        username: user.username,
        display_name: user.display_name,
        user_status_id: 1,
        day: dayIdx,
        record_status_id: 2,
      })),
    }))
  );

  const fetchTableData = () => {
    const startDate = format(selectedDate, 'yyyy-MM-dd');
    const endDate = format(addDays(selectedDate, 5), 'yyyy-MM-dd');

    setApiStatus({
      isLoading: true,
      isError: false,
      message: '',
    });

    axios
      .post(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/records/get-records-by-manager`,
        {
          managerUsername: userData.username,
          startDate: startDate,
          endDate: endDate,
        }
      )
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
  }, [selectedDate, modalIsOpen]);

  const views = [
    {
      name: 'Yeni Kayıt',
      value: 'newrecord',
    },
    {
      name: 'Geçmiş Kayıtlar',
      value: 'records',
    },
  ];

  return (
    <>
      <Layout title='PDKS | Anasayfa' displayName={userData.display_name}>
        <div className='flex  flex-col gap-6 px-10 py-6'>
          <div className='flex items-center justify-between'>
            <ViewRadio
              selected={selectedView}
              setSelected={setSelectedView}
              views={views}
              setSelectedDate={setSelectedDate}
            />
            <div className='flex gap-4'>
              <div className='flex rounded-lg border border-gray-200 bg-white'>
                <span className='flex items-center rounded-l-lg border-r px-4 text-sm font-semibold text-gray-500'>
                  Hafta
                </span>
                <WeekPicker
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  minDate={
                    selectedView === 'newrecord'
                      ? startOfISOWeek(new Date())
                      : null
                  }
                  maxDate={
                    selectedView === 'newrecord'
                      ? addDays(startOfISOWeek(addDays(new Date(), 7 * 2)), -1)
                      : null
                  }
                />
              </div>
              {selectedView === 'records' ? (
                <button
                  onClick={() => fetchTableData()}
                  type='button'
                  className='flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-400 hover:text-green-600 '
                >
                  <ArrowPathIcon className='h-5 w-5' />
                </button>
              ) : null}
            </div>
          </div>

          {selectedView === 'newrecord' ? (
            <>
              <NewRecordTable
                newRecords={newRecords}
                setNewRecords={setNewRecords}
                userStatuses={userStatuses}
                selectedDate={selectedDate}
              />
              <button
                className='self-end rounded-lg bg-green-500 px-8 py-3 font-semibold text-white hover:bg-green-600 '
                onClick={() => setModalIsOpen(true)}
              >
                Tümünü Gönder
              </button>
            </>
          ) : null}

          {selectedView === 'records' ? (
            <DashboardRecords
              records={records}
              userStatuses={userStatuses}
              selectedDate={selectedDate}
              apiStatus={apiStatus}
              selectedDateRange='week'
              isDashboard={false}
            />
          ) : null}
        </div>
      </Layout>
      <NewRecordsModal
        isOpen={modalIsOpen}
        setIsOpen={setModalIsOpen}
        newRecords={newRecords}
        selectedDate={selectedDate}
        records={records}
      />
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
    };

  const userData = await verifyToken(context.req.headers.cookie);
  console.log(userData);

  if (!userData || userData.is_manager === false)
    return {
      redirect: {
        permanent: false,
        destination: '/giris',
      },
    };

  const directReports = await getDirectReports(userData.username);
  const userStatuses = await getUserStatuses();

  return {
    props: { directReports, userStatuses, userData },
  };
}
