import { useEffect, useState } from 'react';
import axios from 'axios';
import verifyToken from '../backend/verifyToken';
import { startOfISOWeek, addDays, format } from 'date-fns';
import { getUserStatuses, getUsersWithManagers } from '../database/dbOps';
import Layout from '../components/layout/Layout';
import WeekPicker from '../components/WeekPicker';
import ModalDialog from '../components/ModalDialog';
import DateRangeRadio from '../components/DateRangeRadio';
import DashboardViewRadio from '../components/DashboardViewRadio';
import DashboardHeader from '../components/layout/DashboardHeader';
import DashboardStats from '../components/dashboardViews/DashboardStats';
import DashboardManagers from '../components/dashboardViews/DashboardManagers';
import DashboardRecords from '../components/dashboardViews/DashboardRecords';

// import 'react-datepicker/dist/react-datepicker.css';

export default function Dashboard({ userStatuses, userData, listOfUsers }) {
  const [selectedDate, setSelectedDate] = useState(startOfISOWeek(new Date()));
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [selectedView, setSelectedView] = useState('stats');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [apiStatus, setApiStatus] = useState({
    isLoading: true,
    isError: false,
    message: '',
  });
  const [updateUserDataStatus, setupdateUserDataStatus] = useState({
    isLoading: false,
    isError: false,
    message: '',
  });

  const fetchTableData = (date) => {
    const startDate = format(date, 'yyyy-MM-dd');
    const endDate = format(addDays(date, 5), 'yyyy-MM-dd');

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
    fetchTableData(selectedDate);
  }, [selectedDate]);

  return (
    <>
      <Layout title='PDKS | Dashboard' displayName={userData.display_name}>
        <DashboardHeader />

        <div className='flex  flex-col gap-6 px-10 py-6'>
          <div className='flex items-center justify-between'>
            <DashboardViewRadio
              selected={selectedView}
              setSelected={setSelectedView}
            />
            <div className='flex gap-4'>
              <DateRangeRadio
                selected={selectedDateRange}
                setSelected={setSelectedDateRange}
              />
              <div className='flex rounded-lg border border-gray-200 bg-white'>
                <span className='flex items-center rounded-l-lg border-r px-4 text-sm font-semibold text-gray-500'>
                  Tarih
                </span>
                <WeekPicker
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </div>
            </div>
          </div>

          {selectedView === 'stats' ? (
            <DashboardStats records={records} userStatuses={userStatuses} />
          ) : null}
          {selectedView === 'records' ? (
            <DashboardRecords
              records={records}
              userStatuses={userStatuses}
              selectedDate={selectedDate}
              apiStatus={apiStatus}
            />
          ) : null}
          {selectedView === 'managers' ? (
            <DashboardManagers
              listOfUsers={listOfUsers}
              records={records}
              apiStatus={apiStatus}
              selectedDate={selectedDate}
            />
          ) : null}
        </div>
      </Layout>

      <ModalDialog
        isOpen={modalIsOpen}
        setIsOpen={setModalIsOpen}
        apiStatus={updateUserDataStatus}
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

// {
//   !(['managers', 'records', 'stats'].indexOf(selectedView) > -1) && (
//     <>
//       <DashboardStats records={records} userStatuses={userStatuses} />
//       <DashboardRecords
//         records={records}
//         userStatuses={userStatuses}
//         selectedDate={selectedDate}
//         apiStatus={apiStatus}
//       />
//       <DashboardManagers
//         listOfUsers={listOfUsers}
//         records={records}
//         apiStatus={apiStatus}
//       />
//     </>
//   );
// }
