import { useState } from 'react';
import verifyToken from '../backend/verifyToken';
import { getDirectReports, getUserStatuses } from '../database/dbOps';
import NewRecordTable from '../components/table/NewRecordTable';
import DatePicker from 'react-datepicker';
import { isSameISOWeek, startOfISOWeek, addDays, format } from 'date-fns';
import axios from 'axios';
import Layout from '../components/layout/Layout';

export default function Home({ directReports, userStatuses }) {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  const [startDate, setStartDate] = useState(startOfISOWeek(new Date()));
  const [apiStatus, setApiStatus] = useState({
    isLoading: false,
    isError: false,
    message: '',
  });
  console.log(apiStatus);
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
    const recordsToSend = records
      .map((dayOfRecords) => {
        const recordDate = format(
          addDays(startDate, dayOfRecords.dayIdx),
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
    <Layout title='Anasayfa'>
      <div className='flex  flex-col gap-6 px-10 py-6'>
        <div className='flex items-center justify-between'>
          <h1 className='w-full text-xl font-bold text-gray-700'>
            Personel Haftalık Devam Çizelgesi
          </h1>
          <div className='flex items-center'>
            <span>Hafta:</span>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(startOfISOWeek(date))}
              startDate={startDate}
              // endDate={endDate}
              // selectsRange
              fixedHeight
              dateFormat='dd-MM-yyyy'
              // inline
              calendarStartDay={1}
              nextMonthButtonLabel='>'
              previousMonthButtonLabel='<'
              // locale={`tr-TR`}
              dayClassName={(date) =>
                isSameISOWeek(date, startDate)
                  ? 'react-datepicker__day--selected'
                  : ''
              }
              popperPlacement='top-end'
              popperModifiers={[
                {
                  name: 'offset',
                  options: {
                    offset: [0, 4],
                  },
                },
                {
                  name: 'preventOverflow',
                  options: {
                    rootBoundary: 'viewport',
                    tether: false,
                    altAxis: true,
                  },
                },
              ]}
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
          className='self-end rounded-lg bg-green-500 px-8 py-2 text-sm font-semibold text-white hover:bg-green-600 '
          onClick={sendRecords}
        >
          Gönder
        </button>
      </div>
    </Layout>
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
    props: { directReports, userStatuses },
  };
}
