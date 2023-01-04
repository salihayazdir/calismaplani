import { useState, useEffect } from 'react';
import axios from 'axios';
import verifyToken from '../backend/verifyToken';
import {
  getAuthorizedPersonnelByManager,
  getDirectReports,
  getUserStatuses,
} from '../database/dbOps';
import NewRecordTable from '../components/table/NewRecordTable';
import { startOfISOWeek, endOfISOWeek, addDays, format } from 'date-fns';
import Layout from '../components/layout/Layout';
import WeekPicker from '../components/datepickers/WeekPicker';
import NewRecordsModal from '../components/modals/NewRecordsModal';
import AuthorizedPersonnelModal from '../components/modals/AuthorizedPersonnelModal';
import DashboardRecordsView from '../components/dashboardViews/DashboardRecordsView';
import DailyStats from '../components/charts/DailyStats';
import ViewRadio from '../components/radio/ViewRadio';
import { ArrowPathIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
import { addLog } from '../database/dbOps';
import _ from 'lodash';

export default function Home({
  directReports,
  userStatuses,
  userData,
  initialAuthorizedPersonnel,
  isAuthorizedPersonnel,
}) {
  useEffect(() => {
    document.body.style.zoom = '90%';
  }, []);

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  const [selectedDate, setSelectedDate] = useState(
    startOfISOWeek(addDays(new Date(), 7))
  );
  const [selectedView, setSelectedView] = useState('newrecord');
  const [records, setRecords] = useState([]);
  const [newRecordModalIsOpen, setNewRecordModalIsOpen] = useState(false);
  const [authorizedPersonnelModalIsOpen, setAuthorizedPersonnelModalIsOpen] =
    useState(false);
  const [authorizedPersonnel, setAuthorizedPersonnel] = useState(
    initialAuthorizedPersonnel
  );
  const [apiStatus, setApiStatus] = useState({
    isLoading: true,
    isError: false,
    message: '',
  });
  const [prevRecordsExist, setPrevRecordsExist] = useState(false);

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
  //   if (apiStatus.isError === true) signOut();
  // }, [apiStatus]);

  useEffect(() => {
    if (records.length !== 0) {
      setPrevRecordsExist(true);
    } else {
      setPrevRecordsExist(false);
    }
  }, [records]);

  const [newRecords, setNewRecords] = useState(
    days.map((day, dayIdx) => ({
      dayIdx,
      dayDisplayName: day,
      data: directReports.map((user) => {
        return {
          username: user.username,
          display_name: user.display_name,
          physicalDeliveryOfficeName: user.physicalDeliveryOfficeName,
          mail: user.mail,
          user_status_id: 1,
          day: dayIdx,
          record_status_id: 2,
        };
      }),
    }))
  );

  const [previousRecords, setPreviousRecords] = useState(() =>
    days.map((day, dayIdx) => {
      const recordsOfTheDay = records.filter(
        (record) =>
          record.record_date.slice(0, 10) ===
          format(addDays(selectedDate, dayIdx), 'yyyy-MM-dd')
      );
      return {
        dayIdx,
        dayDisplayName: day,
        data: directReports.map((user) => {
          let status;
          const recordOfTheUser = recordsOfTheDay.filter(
            (record) => record.username === user.username
          );
          if (recordOfTheUser.length !== 1) {
            status = 1;
          } else {
            status = recordOfTheUser[0].user_status_id;
          }
          return {
            username: user.username,
            display_name: user.display_name,
            physicalDeliveryOfficeName: user.physicalDeliveryOfficeName,
            mail: user.mail,
            user_status_id: status,
            day: dayIdx,
            record_status_id: 2,
          };
        }),
      };
    })
  );

  const fillWithPreviousRecords = () => {
    setNewRecords(previousRecords);
  };

  useEffect(() => {
    setPreviousRecords(() =>
      days.map((day, dayIdx) => {
        const recordsOfTheDay = records.filter(
          (record) =>
            record.record_date.slice(0, 10) ===
            format(addDays(selectedDate, dayIdx), 'yyyy-MM-dd')
        );
        return {
          dayIdx,
          dayDisplayName: day,
          data: directReports.map((user) => {
            let status;
            const recordOfTheUser = recordsOfTheDay.filter(
              (record) => record.username === user.username
            );
            if (recordOfTheUser.length !== 1) {
              status = 1;
            } else {
              status = recordOfTheUser[0].user_status_id;
            }
            return {
              username: user.username,
              display_name: user.display_name,
              physicalDeliveryOfficeName: user.physicalDeliveryOfficeName,
              mail: user.mail,
              user_status_id: status,
              day: dayIdx,
              record_status_id: 2,
            };
          }),
        };
      })
    );
  }, [records]);

  const [
    tableIsFilledWithPreviousRecords,
    setTableIsFilledWithPreviousRecords,
  ] = useState(false);

  useEffect(() => {
    setTableIsFilledWithPreviousRecords(
      Boolean(
        JSON.stringify(
          _.sortBy(
            previousRecords.map((dayOfRecords) => {
              return {
                dayIdx: dayOfRecords.dayIdx,
                dayDisplayName: dayOfRecords.dayDisplayName,
                data: _.sortBy(dayOfRecords.data, 'display_name'),
              };
            }),
            'dayIdx'
          )
        ) ===
          JSON.stringify(
            _.sortBy(
              newRecords.map((dayOfRecords) => {
                return {
                  dayIdx: dayOfRecords.dayIdx,
                  dayDisplayName: dayOfRecords.dayDisplayName,
                  data: _.sortBy(dayOfRecords.data, 'display_name'),
                };
              }),
              'dayIdx'
            )
          )
      )
    );
  }, [previousRecords, records, newRecords]);

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
          managerUsername: isAuthorizedPersonnel
            ? userData.manager_username
            : userData.username,
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
  }, [selectedDate, newRecordModalIsOpen]);

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

  const directReportsWithoutManager = directReports.filter(
    (user) => user.username !== userData.username
  );

  return (
    <>
      <Layout
        title='Çalışma Planı | Anasayfa'
        displayName={userData.display_name}
      >
        <div className='flex flex-col gap-8 py-8 px-10'>
          <div className='flex items-center justify-between'>
            <ViewRadio
              selected={selectedView}
              setSelected={setSelectedView}
              views={views}
              setSelectedDate={setSelectedDate}
            />
            <div className='flex gap-4'>
              {userData.is_manager ? (
                <button
                  onClick={() => setAuthorizedPersonnelModalIsOpen(true)}
                  className='inline-flex items-center gap-3 rounded-lg border border-gray-200  px-4 py-2 text-center text-xs font-medium text-gray-500 hover:bg-white hover:text-blue-600 '
                >
                  <span>Yetkili Kullanıcılar</span>
                  <UsersIcon className='h-4 w-4' />
                </button>
              ) : null}
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
                  maxDate={addDays(endOfISOWeek(new Date()), 14)}
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
            <Transition
              appear={true}
              show={true}
              enter='transition-opacity duration-500'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='transition-opacity duration-500'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <div className='flex flex-col gap-6'>
                <NewRecordTable
                  newRecords={newRecords}
                  setNewRecords={setNewRecords}
                  userStatuses={userStatuses}
                  selectedDate={selectedDate}
                  authorizedPersonnel={authorizedPersonnel}
                  prevRecordsExist={prevRecordsExist}
                  fillWithPreviousRecords={fillWithPreviousRecords}
                  apiStatus={apiStatus}
                  tableIsFilledWithPreviousRecords={
                    tableIsFilledWithPreviousRecords
                  }
                />
                <button
                  className='self-end rounded-lg bg-green-500 px-8 py-3 font-semibold text-white hover:bg-green-600 '
                  onClick={() => setNewRecordModalIsOpen(true)}
                >
                  Tümünü Gönder
                </button>
              </div>
            </Transition>
          ) : null}

          {selectedView === 'records' ? (
            <>
              <DashboardRecordsView
                records={records}
                userStatuses={userStatuses}
                selectedDate={selectedDate}
                apiStatus={apiStatus}
                selectedDateRange='week'
                isDashboard={false}
              />
              {records.length !== 0 ? (
                <DailyStats
                  records={records}
                  userStatuses={userStatuses}
                  selectedDate={selectedDate}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </Layout>

      {newRecordModalIsOpen ? (
        <NewRecordsModal
          isOpen={newRecordModalIsOpen}
          setIsOpen={setNewRecordModalIsOpen}
          newRecords={newRecords}
          selectedDate={selectedDate}
          prevRecordsExist={prevRecordsExist}
        />
      ) : null}

      {authorizedPersonnelModalIsOpen ? (
        <AuthorizedPersonnelModal
          isOpen={authorizedPersonnelModalIsOpen}
          setIsOpen={setAuthorizedPersonnelModalIsOpen}
          authorizedPersonnel={authorizedPersonnel}
          setAuthorizedPersonnel={setAuthorizedPersonnel}
          directReportsWithoutManager={directReportsWithoutManager}
        />
      ) : null}
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    if (!context.req.headers.cookie) throw '/giris';
    const userData = await verifyToken(context.req.headers.cookie);

    if (
      !userData ||
      (userData.is_manager !== true && userData.isAuthorizedPersonnel !== true)
    ) {
      if (userData.is_hr === true) throw '/dashboard';
      if (userData.is_hr !== true) throw '/giris';
    }

    let authorizedPersonnelRequest;
    if (userData.is_manager === true)
      authorizedPersonnelRequest = await getAuthorizedPersonnelByManager(
        userData.username
      );
    if (userData.isAuthorizedPersonnel === true)
      authorizedPersonnelRequest = await getAuthorizedPersonnelByManager(
        userData.manager_username
      );

    if (!Array.isArray(authorizedPersonnelRequest.result))
      throw 'DB error (index/ authorizedPersonnelRequest.result)';

    const authorizedPersonnel = authorizedPersonnelRequest.result.map(
      (user) => user.username
    );

    let directReports;
    if (userData.is_manager === true)
      directReports = await getDirectReports(userData.username);
    if (userData.isAuthorizedPersonnel === true)
      directReports = await getDirectReports(userData.manager_username);
    const userStatuses = await getUserStatuses();

    return {
      props: {
        directReports,
        userStatuses,
        userData,
        initialAuthorizedPersonnel: authorizedPersonnel,
        isAuthorizedPersonnel: userData.isAuthorizedPersonnel,
      },
    };
  } catch (err) {
    if (err === '/giris' || err === '/' || err === '/dashboard')
      return {
        redirect: {
          permanent: false,
          destination: err,
        },
      };
    else {
      addLog({
        type: 'props',
        isError: true,
        username: userData.username ? userData.username : null,
        info: `/index ${err}`,
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
