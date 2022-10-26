import { useEffect, useState } from 'react';
import axios from 'axios';
import verifyToken from '../backend/verifyToken';
import { startOfISOWeek, addDays, format } from 'date-fns';
import { getUserStatuses } from '../database/dbOps';
import DashboardTable from '../components/table/DashboardTable';
import WeekPicker from '../components/WeekPicker';
import Layout from '../components/layout/Layout';
import Loader from '../components/Loader';
import DoughnutChart from '../components/dashboard/DoughnutChart';
import BarChart from '../components/dashboard/BarChart';
import ModalDialog from '../components/ModalDialog';

// import 'react-datepicker/dist/react-datepicker.css';

export default function Dashboard({ userStatuses, userData }) {
  const [selectedDate, setSelectedDate] = useState(startOfISOWeek(new Date()));
  const [reportRange, setReportRange] = useState('month');
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

  const fetchTableData = (date, reportRange) => {
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

  const updateUserData = () => {
    console.log('update');
    setupdateUserDataStatus({
      isLoading: true,
      isError: false,
      message: '',
    });
    setModalIsOpen(true);

    axios
      .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/users/update`)
      .then((res) => {
        if (res.data.success === true) {
          setRecords(res.data.records);
          setupdateUserDataStatus({
            isLoading: false,
            isError: false,
            message: res.data.message || '',
          });
        } else {
          setupdateUserDataStatus({
            isLoading: false,
            isError: true,
            message: res.data.message || 'Bağlantı hatası.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setupdateUserDataStatus({
          isLoading: false,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  return (
    <>
      <Layout title='PDKS | Dashboard' displayName={userData.display_name}>
        <div className='flex  flex-col gap-6 px-10 py-6'>
          <div className='flex items-center justify-between'>
            <h1 className='w-full text-xl font-bold text-gray-700'>
              Personel Devam Raporu
            </h1>
            <div className='flex gap-4'>
              <button
                onClick={updateUserData}
                disabled
                className='whitespace-nowrap rounded-lg border border-gray-50 bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-500'
              >
                Kullanıcıları Güncelle
              </button>
              <div className='flex rounded-lg border border-gray-200 bg-white  shadow-lg'>
                <span className='flex items-center rounded-l-lg border-r px-4 text-sm font-semibold text-gray-500'>
                  Hafta
                </span>
                <WeekPicker
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </div>
            </div>
          </div>
          <div className='flex justify-between gap-6 '>
            <div className='w-2/3 items-center justify-center rounded-lg border border-gray-200 bg-white'>
              <BarChart records={records} userStatuses={userStatuses} />
            </div>
            <div className='w-1/3 rounded-lg border border-gray-200 bg-white '>
              <DoughnutChart records={records} userStatuses={userStatuses} />
            </div>
          </div>
          <div className='flex flex-col rounded-xl border border-gray-200 bg-white py-4'>
            {apiStatus.isLoading ? (
              <Loader />
            ) : (
              <DashboardTable
                records={records}
                userStatuses={userStatuses}
                selectedDate={selectedDate}
              />
            )}
          </div>
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
  return {
    props: { userStatuses, userData },
  };
}
