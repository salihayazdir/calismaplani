import { useState } from 'react';
import verifyToken from '../backend/verifyToken';
import { getDirectReports, getUserStatuses } from '../database/dbOps';
import NewRecordTable from '../components/table/NewRecordTable';
import { startOfISOWeek, addDays, format } from 'date-fns';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import ModalDialog from '../components/ModalDialog';
import WeekPicker from '../components/WeekPicker';

export default function Home({ directReports, userStatuses, userData }) {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  const [selectedDate, setSelectedDate] = useState(
    startOfISOWeek(addDays(new Date(), 7))
  );
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    isLoading: false,
    isError: false,
    message: '',
  });
  const [records, setRecords] = useState(
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

  const sendRecords = () => {
    setApiStatus({
      isLoading: true,
      isError: false,
      message: '',
    });
    setModalIsOpen(true);

    const recordsToSend = records
      .map((dayOfRecords) => {
        const recordDate = format(
          addDays(selectedDate, dayOfRecords.dayIdx),
          'yyyy-MM-dd'
        );
        return dayOfRecords.data.map((record) => ({
          username: record.username,
          record_date: recordDate,
          user_status_id: record.user_status_id,
          record_status_id: record.record_status_id,
        }));
      })
      .flat();

    axios
      .post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/records/add-record`, {
        records: recordsToSend,
      })
      .then((res) => {
        console.log(res);
        if (res.data.success === true) {
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

  return (
    <>
      <Layout title='PDKS | Anasayfa' displayName={userData.display_name}>
        <div className='flex  flex-col gap-6 px-10 py-6'>
          <div className='flex items-center justify-between'>
            <h1 className='w-full text-xl font-bold text-gray-700'>
              Personel Haftalık Devam Çizelgesi
            </h1>
            <div className='flex rounded-lg border border-gray-200 bg-white  shadow-lg'>
              <span className='flex items-center rounded-l-lg border-r px-4 text-sm font-semibold text-gray-500'>
                Hafta
              </span>
              <WeekPicker
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                minDate={startOfISOWeek(addDays(new Date(), 7))}
                maxDate={addDays(
                  startOfISOWeek(addDays(new Date(), 7 * 3)),
                  -1
                )}
              />
            </div>
          </div>
          <div className='flex flex-col rounded-xl border border-gray-200 bg-white pb-4'>
            <NewRecordTable
              records={records}
              setRecords={setRecords}
              userStatuses={userStatuses}
            />
          </div>
          <button
            className='self-end rounded-lg bg-green-500 px-10 py-3 font-semibold text-white hover:bg-green-600 '
            onClick={sendRecords}
          >
            Gönder
          </button>
        </div>
      </Layout>
      <ModalDialog
        isOpen={modalIsOpen}
        setIsOpen={setModalIsOpen}
        apiStatus={apiStatus}
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
