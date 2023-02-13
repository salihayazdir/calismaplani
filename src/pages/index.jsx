import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import verifyToken from '../backend/verifyToken';
import { getDirectReports, getUserStatuses } from '../database/dbOps';
import NewRecordTable from '../components/table/NewRecordTable';
import { startOfISOWeek, endOfISOWeek, addDays, format } from 'date-fns';
import Layout from '../components/layout/Layout';
import WeekPicker from '../components/datepickers/WeekPicker';
import NewRecordsModal from '../components/modals/NewRecordsModal';
import AuthorizedPersonnelModal from '../components/modals/AuthorizedPersonnelModal';
import TeamsModal from '../components/modals/TeamsModal';
import DashboardRecordsView from '../components/dashboardViews/DashboardRecordsView';
import DailyStats from '../components/charts/DailyStats';
import ViewRadio from '../components/radio/ViewRadio';
import {
  ArrowPathIcon,
  UsersIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';
import { addLog } from '../database/dbOps';
import _ from 'lodash';

export default function Home({
  initialDirectReports,
  userStatuses,
  userData,
  directReportsManagerUsername,
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
  const [directReports, setDirectReports] = useState(initialDirectReports);
  const [newRecordModalIsOpen, setNewRecordModalIsOpen] = useState(false);
  const [sendingOnlyTheSelectedRecords, setSendingOnlyTheSelectedRecords] =
    useState(false);
  const [authorizedPersonnelModalIsOpen, setAuthorizedPersonnelModalIsOpen] =
    useState(false);
  const [teamsModalIsOpen, setTeamsModalIsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    isLoading: true,
    isError: false,
    message: '',
  });
  const [prevRecordsExist, setPrevRecordsExist] = useState(false);
  const [selectedUsernames, setSelectedUsernames] = useState([]);
  const [forceTableDataRerender, setForceTableDataRerender] = useState(true);

  const managerUsername =
    userData.is_manager !== true
      ? userData.manager_username
      : userData.username;

  const isLeaderAndUnAuthorized = Boolean(
    userData.is_manager !== true &&
      userData.is_authorized !== true &&
      userData.is_leader === true
  );

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
          is_authorized: user.is_authorized,
          mail: user.mail,
          user_status_id: 0,
          day: dayIdx,
          record_status_id: 2,
        };
      }),
    }))
  );

  useEffect(() => {
    setNewRecords((prevNewRecords) => {
      return days.map((day, dayIdx) => ({
        dayIdx,
        dayDisplayName: day,
        data: directReports.map((user) => {
          const prevStatus = prevNewRecords
            .filter((dayOfRecords) => dayOfRecords.dayIdx === dayIdx)[0]
            .data.filter(
              (prevUser) => prevUser.username === user.username
            )[0].user_status_id;
          return {
            username: user.username,
            display_name: user.display_name,
            physicalDeliveryOfficeName: user.physicalDeliveryOfficeName,
            is_authorized: user.is_authorized,
            mail: user.mail,
            user_status_id: prevStatus,
            day: dayIdx,
            record_status_id: 2,
          };
        }),
      }));
    });
  }, [directReports]);

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
          managerUsername,
          startDate,
          endDate,
        }
      )
      .then((res) => {
        if (res.data.success === true) {
          if (isLeaderAndUnAuthorized) {
            const directReportsUsernames = directReports.map(
              (user) => user.username
            );
            setRecords(
              res.data.records.filter(
                (record) =>
                  directReportsUsernames.indexOf(record.username) !== -1
              )
            );
          } else {
            setRecords(res.data.records);
          }
          setApiStatus({
            isLoading: false,
            isError: false,
            message: res.data.message || '',
          });
          setForceTableDataRerender((prev) => !prev);
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
  }, [selectedDate]);

  const usersWithPreviousRecords = useMemo(
    () => [...new Set(records.map((record) => record.username))],
    [records]
  );

  const fetchDirectReports = () => {
    // setApiStatus({
    //   isLoading: true,
    //   isError: false,
    //   message: '',
    // });

    axios
      .get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/users/get-direct-reports`, {
        params: {
          managerUsername: directReportsManagerUsername,
        },
      })
      .then((res) => {
        if (res.data.success === true) {
          if (isLeaderAndUnAuthorized) {
            const directReportsOfTeamLeader = res.data.directReports.filter(
              (user) => user.leader_username === userData.username
            );
            setDirectReports(directReportsOfTeamLeader);
          } else {
            setDirectReports(res.data.directReports);
          }
          // setApiStatus({
          //   isLoading: false,
          //   isError: false,
          //   message: res.data.message || '',
          // });
        } else {
          // console.log(res);
          // setApiStatus({
          //   isLoading: false,
          //   isError: true,
          //   message: res.data.message || 'Bağlantı hatası.',
          // });
        }
      })
      .catch((err) => {
        console.error(err);
        // setApiStatus({
        //   isLoading: false,
        //   isError: true,
        //   message: 'Bağlantı hatası.',
        // });
      });
  };

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

  const allUnselectedRecords = newRecords
    .map((day) =>
      day.data.map((record) => ({
        username: record.username,
        status: record.user_status_id,
      }))
    )
    .flat()
    .filter((record) => record.status === 0);
  const unselectedStatusExists = allUnselectedRecords.length !== 0;

  const unselectedStatusExistsInSelectedRows = Boolean(
    allUnselectedRecords.filter(
      (record) => selectedUsernames.indexOf(record.username) !== -1
    ).length !== 0
  );

  const isThereASelectedRow = Boolean(selectedUsernames.length !== 0);

  const isSendSelectedRecordsButonDisabled = Boolean(
    unselectedStatusExistsInSelectedRows || !isThereASelectedRow
  );

  const handleNextPrevDate = (action) => {
    const isNext = action === 'next';
    if (isNext) {
      setSelectedDate((prev) => addDays(prev, 7));
    } else {
      setSelectedDate((prev) => addDays(prev, -7));
    }
  };

  const nextWeekButtonDisabled = Boolean(
    selectedDate > addDays(endOfISOWeek(new Date()), 7)
  );
  const previousWeekButtonDisabled =
    selectedView === 'newrecord'
      ? Boolean(selectedDate < addDays(startOfISOWeek(new Date()), 7))
      : false;

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
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
            <div className='flex gap-4'>
              {userData.is_manager || userData.is_authorized ? (
                <button
                  onClick={() => setTeamsModalIsOpen(true)}
                  className='inline-flex items-center gap-3 rounded-lg border border-gray-200  px-4 py-2 text-center text-xs font-medium text-gray-500 hover:bg-white hover:text-blue-600 '
                >
                  <span>Ekipler</span>
                  <UsersIcon className='h-4 w-4' />
                </button>
              ) : null}

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
              <div className='flex items-stretch divide-x divide-gray-200 rounded-lg border border-gray-200 bg-white  '>
                <button
                  disabled={previousWeekButtonDisabled}
                  onClick={() => handleNextPrevDate('prev')}
                  className='flex w-10 items-center justify-center rounded-l-lg text-blue-600 hover:bg-blue-600 hover:text-white disabled:text-gray-300 disabled:hover:bg-white disabled:hover:text-gray-300'
                >
                  <ChevronLeftIcon className='h-4 w-4' />
                </button>
                <button
                  disabled={nextWeekButtonDisabled}
                  onClick={() => handleNextPrevDate('next')}
                  className='flex w-10 items-center justify-center rounded-r-lg text-blue-600 hover:bg-blue-600 hover:text-white disabled:text-gray-300 disabled:hover:bg-white disabled:hover:text-gray-300'
                >
                  <ChevronRightIcon className='h-4 w-4' />
                </button>
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
                  prevRecordsExist={prevRecordsExist}
                  apiStatus={apiStatus}
                  // fillWithPreviousRecords={fillWithPreviousRecords}
                  // tableIsFilledWithPreviousRecords={
                  //   tableIsFilledWithPreviousRecords
                  // }
                  directReports={directReports}
                  isLeaderAndUnAuthorized={isLeaderAndUnAuthorized}
                  setSelectedUsernames={setSelectedUsernames}
                  forceTableDataRerender={forceTableDataRerender}
                  usersWithPreviousRecords={usersWithPreviousRecords}
                  records={records}
                />
                <div className='flex gap-4 self-end text-center align-middle'>
                  {unselectedStatusExists ? (
                    <div className='flex items-center gap-4 rounded-lg bg-amber-100 pr-4 pl-6 text-yellow-700 '>
                      <span className=' text-left text-xs'>
                        Kayıt gönderebilmek için
                        <br /> statü seçimlerini doldurmalısınız.
                      </span>
                      <ExclamationCircleIcon className='h-8 w-8' />
                    </div>
                  ) : null}
                  <button
                    disabled={isSendSelectedRecordsButonDisabled}
                    className=' rounded-lg bg-blue-500 px-8 py-3 font-semibold text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:hover:bg-gray-300  '
                    onClick={() => {
                      setSendingOnlyTheSelectedRecords(true);
                      setNewRecordModalIsOpen(true);
                    }}
                  >
                    <span>Seçilileri Gönder</span>
                    {selectedUsernames.length !== 0 ? (
                      <span>{`  (${selectedUsernames.length})`}</span>
                    ) : (
                      ''
                    )}
                  </button>
                  <button
                    disabled={unselectedStatusExists}
                    className=' rounded-lg bg-green-500 px-8 py-3 font-semibold text-white hover:bg-green-600 disabled:bg-gray-300 disabled:hover:bg-gray-300  '
                    onClick={() => setNewRecordModalIsOpen(true)}
                  >
                    Tümünü Gönder
                  </button>
                </div>
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
                fetchTableData={fetchTableData}
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
          prevRecordsExist={
            sendingOnlyTheSelectedRecords
              ? selectedUsernames.some(
                  (user) => usersWithPreviousRecords.indexOf(user) >= 0
                )
              : prevRecordsExist
          }
          sendingOnlyTheSelectedRecords={sendingOnlyTheSelectedRecords}
          setSendingOnlyTheSelectedRecords={setSendingOnlyTheSelectedRecords}
          selectedUsernames={selectedUsernames}
          fetchTableData={fetchTableData}
        />
      ) : null}

      {authorizedPersonnelModalIsOpen ? (
        <AuthorizedPersonnelModal
          isOpen={authorizedPersonnelModalIsOpen}
          setIsOpen={setAuthorizedPersonnelModalIsOpen}
          directReportsWithoutManager={directReportsWithoutManager}
          fetchDirectReports={fetchDirectReports}
        />
      ) : null}

      {teamsModalIsOpen ? (
        <TeamsModal
          isOpen={teamsModalIsOpen}
          setIsOpen={setTeamsModalIsOpen}
          directReportsWithoutManager={directReportsWithoutManager}
          managerUsername={managerUsername}
          directReports={directReports}
          fetchDirectReports={fetchDirectReports}
          setForceTableDataRerender={setForceTableDataRerender}
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
      (userData.is_manager !== true &&
        userData.is_authorized !== true &&
        userData.is_leader !== true)
    ) {
      if (userData.is_hr === true) throw '/dashboard';
      if (userData.is_hr !== true) throw '/giris';
    }

    let directReportsManagerUsername;

    if (userData.is_manager === true) {
      directReportsManagerUsername = userData.username;
    } else {
      directReportsManagerUsername = userData.manager_username;
    }

    const directReports = await getDirectReports(directReportsManagerUsername);

    const isLeaderAndUnAuthorized = Boolean(
      userData.is_manager !== true &&
        userData.is_authorized !== true &&
        userData.is_leader === true
    );

    const directReportsOfTeamLeader = directReports.filter(
      (user) => user.leader_username === userData.username
    );

    const userStatuses = await getUserStatuses();

    return {
      props: {
        initialDirectReports: isLeaderAndUnAuthorized
          ? directReportsOfTeamLeader
          : directReports,
        userStatuses,
        userData,
        directReportsManagerUsername,
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
