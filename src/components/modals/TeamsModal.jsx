import {
  Dialog,
  Combobox,
  Transition,
  Disclosure,
  Popover,
} from '@headlessui/react';
import { Fragment, useState, useEffect, useMemo } from 'react';
import Loader from '../skeletons/Loader';
import axios from 'axios';
import _ from 'lodash';
import {
  XMarkIcon,
  CheckIcon,
  ChevronUpDownIcon,
  TrashIcon,
  PlusIcon,
  ChevronUpIcon,
  UserGroupIcon,
  PencilSquareIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

export default function TeamsModal({
  isOpen,
  setIsOpen,
  managerUsername,
  directReports,
  fetchDirectReports,
  setForceTableDataRerender,
}) {
  const [teamMemberRecords, setTeamMemberRecords] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(0);
  const [newTeamNameInput, setNewTeamNameInput] = useState('');
  const [editTeamNameInput, setEditTeamNameInput] = useState('');
  const [apiStatus, setApiStatus] = useState({
    isLoading: true,
    isSent: false,
    isError: false,
    message: '',
  });
  const { isLoading, isSent, isError, message } = apiStatus;

  const directReportsWithoutTeam = useMemo(
    () =>
      directReports.filter(
        (user) => user.team_id === null && user.is_manager === false
      ),
    [directReports]
  );

  console.log(directReports);

  const [selectedNewTeamLeader, setSelectedNewTeamLeader] = useState(
    directReportsWithoutTeam[0]
  );
  const [selectboxSearchQuery, setSelectboxSearchQuery] = useState('');

  const filteredDirectReportsWithoutTeam =
    selectboxSearchQuery === ''
      ? directReportsWithoutTeam
      : directReportsWithoutTeam.filter((user) =>
          user.display_name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(selectboxSearchQuery.toLowerCase().replace(/\s+/g, ''))
        );

  const teams = [
    ...new Set(
      teamMemberRecords.map((record) =>
        JSON.stringify({
          team_id: record.team_id,
          team_display_name: record.team_display_name,
          leader_display_name: record.leader_display_name,
        })
      )
    ),
  ].map((team) => JSON.parse(team));

  const selectedTeam = teams.filter(
    (team) => team.team_id === selectedTeamId
  )[0];

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = () => {
    setApiStatus((prev) => ({
      isLoading: true,
      isSent: false,
      isError: false,
      message: prev.message,
    }));

    axios
      .get(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/users/teams/get-teams-by-manager`,
        {
          params: { manager_username: managerUsername },
        }
      )
      .then((res) => {
        // console.log(res);
        if (res.data.success === true) {
          setApiStatus((prev) => ({
            isLoading: false,
            isSent: true,
            isError: false,
            message: prev.isError ? '' : prev.message,
          }));
          setTeamMemberRecords(res.data.teamsData);
          fetchDirectReports();
        } else {
          setApiStatus({
            isLoading: false,
            isError: true,
            isSent: true,
            message: res.data.message || 'Bağlantı hatası.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setApiStatus({
          isLoading: false,
          isSent: true,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  const handleNewTeamFormSubmit = (e) => {
    e.preventDefault();
    setApiStatus({
      isLoading: true,
      isSent: false,
      isError: false,
      message: '',
    });

    axios
      .post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/users/teams/add-team`, {
        teamLeaderUsername: selectedNewTeamLeader.username,
        teamDisplayName: newTeamNameInput,
      })
      .then((res) => {
        if (res.data.success === true) {
          setApiStatus({
            isLoading: false,
            isSent: true,
            isError: false,
            message: res.data.message || '',
          });
          fetchTeams();
        } else {
          setApiStatus({
            isLoading: false,
            isError: true,
            isSent: true,
            message: res.data.message || 'Bağlantı hatası.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setApiStatus({
          isLoading: false,
          isSent: true,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  const handleNewTeamMemberSubmit = () => {
    setApiStatus({
      isLoading: true,
      isSent: false,
      isError: false,
      message: '',
    });

    axios
      .post(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/users/teams/add-team-member`,
        {
          teamId: selectedTeamId,
          memberUsername: selectedNewTeamLeader.username,
        }
      )
      .then((res) => {
        // console.log(res);
        if (res.data.success === true) {
          setApiStatus({
            isLoading: false,
            isSent: true,
            isError: false,
            message: res.data.message || '',
          });
          fetchTeams();
        } else {
          setApiStatus({
            isLoading: false,
            isError: true,
            isSent: true,
            message: res.data.message || 'Bağlantı hatası.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setApiStatus({
          isLoading: false,
          isSent: true,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  const handleEditTeamName = (e) => {
    e.preventDefault();
    setApiStatus({
      isLoading: true,
      isSent: false,
      isError: false,
      message: '',
    });

    axios
      .put(`${process.env.NEXT_PUBLIC_DOMAIN}/api/users/teams/edit-team-name`, {
        teamId: selectedTeamId,
        teamDisplayName: editTeamNameInput,
      })
      .then((res) => {
        // console.log(res);
        if (res.data.success === true) {
          setApiStatus({
            isLoading: false,
            isSent: true,
            isError: false,
            message: res.data.message || '',
          });
          fetchTeams();
        } else {
          setApiStatus({
            isLoading: false,
            isError: true,
            isSent: true,
            message: res.data.message || 'Bağlantı hatası.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setApiStatus({
          isLoading: false,
          isSent: true,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  const handleDeleteTeam = () => {
    setApiStatus({
      isLoading: true,
      isSent: false,
      isError: false,
      message: '',
    });

    axios
      .delete(`${process.env.NEXT_PUBLIC_DOMAIN}/api/users/teams/delete-team`, {
        data: {
          teamId: selectedTeamId,
        },
      })
      .then((res) => {
        // console.log(res);
        if (res.data.success === true) {
          setApiStatus({
            isLoading: false,
            isSent: true,
            isError: false,
            message: res.data.message || '',
          });
          fetchTeams();
        } else {
          setApiStatus({
            isLoading: false,
            isError: true,
            isSent: true,
            message: res.data.message || 'Bağlantı hatası.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setApiStatus({
          isLoading: false,
          isSent: true,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  const handleEditTeamLeader = (newLeaderUsername) => {
    setApiStatus({
      isLoading: true,
      isSent: false,
      isError: false,
      message: '',
    });

    axios
      .put(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/users/teams/edit-team-leader`,
        {
          teamId: selectedTeamId,
          teamLeaderUsername: newLeaderUsername,
        }
      )
      .then((res) => {
        // console.log(res);
        if (res.data.success === true) {
          setApiStatus({
            isLoading: false,
            isSent: true,
            isError: false,
            message: res.data.message || '',
          });
          fetchTeams();
        } else {
          setApiStatus({
            isLoading: false,
            isError: true,
            isSent: true,
            message: res.data.message || 'Bağlantı hatası.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setApiStatus({
          isLoading: false,
          isSent: true,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  const handleDeleteTeamMember = (memberUsername) => {
    setApiStatus({
      isLoading: true,
      isSent: false,
      isError: false,
      message: '',
    });

    axios
      .delete(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/users/teams/delete-team-member`,
        {
          data: {
            memberUsername,
          },
        }
      )
      .then((res) => {
        // console.log(res);
        if (res.data.success === true) {
          setApiStatus({
            isLoading: false,
            isSent: true,
            isError: false,
            message: res.data.message || '',
          });
          fetchTeams();
        } else {
          setApiStatus({
            isLoading: false,
            isError: true,
            isSent: true,
            message: res.data.message || 'Bağlantı hatası.',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setApiStatus({
          isLoading: false,
          isSent: true,
          isError: true,
          message: 'Bağlantı hatası.',
        });
      });
  };

  const handleClose = () => {
    setIsOpen(false);
    setForceTableDataRerender((prev) => !prev);
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-10 ' onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto '>
            <div className='flex min-h-full items-center justify-center  p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='min-h-full w-full transform rounded-xl bg-white text-left align-middle shadow-xl transition-all md:max-w-[60vw]'>
                  <div className='flex items-center justify-between border-b border-gray-200 pl-6 pr-3 '>
                    <Dialog.Title
                      as='h3'
                      className='py-3 text-lg font-bold text-gray-900'
                    >
                      Ekipler
                    </Dialog.Title>
                    <div className='flex items-center gap-4'>
                      <div>{isLoading ? <Loader size={6} /> : null}</div>
                      <div>
                        {!isLoading && isSent && message ? (
                          <div
                            className={`rounded-md px-4 py-1 text-sm 
                            ${
                              isError
                                ? 'bg-red-50 text-red-700'
                                : 'bg-green-50 text-green-700'
                            }
                            `}
                          >
                            {message}
                          </div>
                        ) : null}
                      </div>
                      <button
                        onClick={handleClose}
                        className='rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                      >
                        <XMarkIcon className='h-5 w-5' />
                      </button>
                    </div>
                  </div>

                  <div className='flex'>
                    <div className=' flex-1 border-r border-gray-200'>
                      <ul
                        className={`flex flex-col divide-y divide-gray-200 border-gray-200 ${
                          teams.length !== 0 && 'border-b'
                        }`}
                      >
                        {teams.map((team) => {
                          const memberCount = teamMemberRecords.filter(
                            (record) => record.team_id === team.team_id
                          ).length;
                          const isSelected = selectedTeamId === team.team_id;
                          return (
                            <div
                              // key={team.team_id}
                              className='group flex '
                            >
                              <div
                                className={`w-2 bg-white  ${
                                  isSelected
                                    ? 'bg-blue-600'
                                    : 'group-hover:bg-slate-200'
                                }`}
                              ></div>
                              <li
                                onClick={() => setSelectedTeamId(team.team_id)}
                                className={`flex flex-1 cursor-pointer flex-col gap-2 py-5 px-8 `}
                              >
                                <div className=' text-base font-medium'>
                                  {team.team_display_name}
                                </div>
                                <div className='inline-flex items-center gap-2 text-sm'>
                                  <span className='rounded-md bg-sky-50 px-3 py-1  text-sky-700'>
                                    {team.leader_display_name}
                                  </span>
                                  <div className='inline-flex items-center gap-2 rounded-md bg-green-50 px-3 py-1 font-medium text-green-700'>
                                    <UserGroupIcon className='h-4 w-4' />
                                    <span>{memberCount}</span>
                                  </div>
                                </div>
                              </li>
                            </div>
                          );
                        })}
                      </ul>
                      <div className='px-8'>
                        <button
                          onClick={() => setSelectedTeamId('new')}
                          className='my-8 flex w-full items-center gap-4 rounded-lg bg-green-50  py-2  px-4 font-semibold text-green-700 hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400'
                          disabled={directReportsWithoutTeam.length === 0}
                        >
                          <div className='flex items-center'>
                            <PlusIcon className='h-6 w-6' />
                          </div>
                          <span>Ekip Oluştur</span>
                        </button>
                      </div>
                    </div>

                    <div className='flex flex-1 flex-col gap-6 px-8 pt-6 pb-28'>
                      {selectedTeam ? (
                        <>
                          <h2 className='text-xl font-semibold'>
                            {selectedTeam.team_display_name}
                          </h2>

                          <ul className='flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 text-sm'>
                            {teamMemberRecords
                              .filter(
                                (record) =>
                                  record.team_id === selectedTeam.team_id
                              )
                              .map((record, i) => {
                                return (
                                  <li
                                    // key={record.username}
                                    className=' flex items-center justify-between py-1.5 pr-1 pl-3 text-gray-600  hover:text-gray-800'
                                  >
                                    <span className=''>
                                      {record.user_display_name}
                                    </span>
                                    {record.is_leader === true ? (
                                      <div className='rounded-md bg-sky-50 px-6 py-1 text-xs font-medium text-sky-700'>
                                        Ekip Lideri
                                      </div>
                                    ) : (
                                      <div className='flex gap-2 text-xs'>
                                        <button
                                          onClick={() =>
                                            handleEditTeamLeader(
                                              record.username
                                            )
                                          }
                                          className='inline-flex items-center gap-1 rounded-md px-2 py-0.5  font-medium text-gray-500  hover:bg-sky-100 hover:text-sky-700'
                                        >
                                          Lider Ata
                                        </button>
                                        {/* <button
                                          onClick={() =>
                                            handleDeleteTeamMember(
                                              record.username
                                            )
                                          }
                                          className='rounded-md py-1 px-2  text-red-600 hover:bg-red-100 hover:text-red-700 '
                                        >
                                          <TrashIcon className='h-4 w-4 ' />
                                        </button> */}
                                        <Popover className='relative'>
                                          {({ open }) => (
                                            <>
                                              <Popover.Button
                                                className={`
                                  group inline-flex w-full items-center justify-center gap-3 rounded-md py-1 px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
                                  ${
                                    open
                                      ? 'bg-red-600 text-white'
                                      : 'text-red-600 hover:bg-red-100 hover:text-red-700'
                                  }`}
                                              >
                                                <TrashIcon className='h-4 w-4 ' />
                                              </Popover.Button>
                                              <Transition
                                                as={Fragment}
                                                enter='transition ease-out duration-200'
                                                enterFrom='opacity-0 translate-y-1'
                                                enterTo='opacity-100 translate-y-0'
                                                leave='transition ease-in duration-150'
                                                leaveFrom='opacity-100 translate-y-0'
                                                leaveTo='opacity-0 translate-y-1'
                                              >
                                                <Popover.Panel className='absolute right-0 z-10 mt-1.5 w-24 translate-x-2 transform  text-red-800 '>
                                                  <div className='group'>
                                                    <div className='absolute right-4 -top-1 -z-10 h-4 w-4 rotate-45 rounded-sm  bg-red-50 group-hover:bg-red-600'></div>
                                                    <button
                                                      onClick={() =>
                                                        handleDeleteTeamMember(
                                                          record.username
                                                        )
                                                      }
                                                      className='whitespace-nowrap rounded-lg bg-red-50  px-4 py-2 text-xs font-semibold text-red-600 shadow-lg hover:text-white group-hover:bg-red-600 '
                                                    >
                                                      Ekipten Çıkar
                                                    </button>
                                                  </div>
                                                </Popover.Panel>
                                              </Transition>
                                            </>
                                          )}
                                        </Popover>
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
                          </ul>
                          <Disclosure>
                            {({ open }) => (
                              <div className='relative'>
                                <Disclosure.Button
                                  className={`${
                                    open ? 'rounded-t-lg' : 'rounded-lg'
                                  } flex w-full justify-between border border-gray-200 px-4 py-2 text-left font-medium focus:outline-none focus-visible:ring focus-visible:ring-black focus-visible:ring-opacity-75`}
                                >
                                  <div className='group inline-flex w-full items-center justify-between'>
                                    <span className='text-sm'>
                                      Personel Ekle
                                    </span>
                                    <div
                                      className={`inline-flex items-center gap-2 text-xs  ${
                                        open
                                          ? 'text-green-600'
                                          : 'text-gray-400 group-hover:text-green-500'
                                      } `}
                                    >
                                      <span className='font-medium'>
                                        <UserPlusIcon className='h-5 w-5' />
                                      </span>
                                      <ChevronUpIcon
                                        className={`${
                                          open ? '' : 'rotate-180 transform'
                                        } h-5 w-5`}
                                      />
                                    </div>
                                  </div>
                                </Disclosure.Button>
                                <Disclosure.Panel className='absolute z-50 inline-flex w-full gap-3 rounded-b-lg border border-t-0 border-gray-200 bg-white p-5 text-sm shadow-xl'>
                                  <Combobox
                                    value={selectedNewTeamLeader}
                                    onChange={setSelectedNewTeamLeader}
                                  >
                                    <div className='relative w-full'>
                                      <div className='relative w-full cursor-default overflow-hidden rounded-lg border border-gray-200 bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-green-300 sm:text-sm'>
                                        <Combobox.Input
                                          className='w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900  outline-none focus:ring-0'
                                          displayValue={(user) =>
                                            user ? user.display_name : null
                                          }
                                          onChange={(event) =>
                                            setSelectboxSearchQuery(
                                              event.target.value
                                            )
                                          }
                                        />
                                        <Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>
                                          <ChevronUpDownIcon
                                            className='h-5 w-5 text-gray-400'
                                            aria-hidden='true'
                                          />
                                        </Combobox.Button>
                                      </div>
                                      <Transition
                                        as={Fragment}
                                        leave='transition ease-in duration-100'
                                        leaveFrom='opacity-100'
                                        leaveTo='opacity-0'
                                        afterLeave={() =>
                                          setSelectboxSearchQuery('')
                                        }
                                      >
                                        <Combobox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                                          {filteredDirectReportsWithoutTeam.length ===
                                            0 && selectboxSearchQuery !== '' ? (
                                            <div className='relative cursor-default select-none py-2 px-4 text-gray-700'>
                                              Personel bulunamadı.
                                            </div>
                                          ) : (
                                            filteredDirectReportsWithoutTeam.map(
                                              (user) => (
                                                <Combobox.Option
                                                  key={user.username}
                                                  className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                      active
                                                        ? 'bg-green-600 text-white'
                                                        : 'text-gray-900'
                                                    }`
                                                  }
                                                  value={user}
                                                >
                                                  {({ selected, active }) => (
                                                    <>
                                                      <span
                                                        className={`block truncate ${
                                                          selected
                                                            ? 'font-medium'
                                                            : 'font-normal'
                                                        }`}
                                                      >
                                                        {user.display_name}
                                                      </span>
                                                      {selected ? (
                                                        <span
                                                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                            active
                                                              ? 'text-white'
                                                              : 'text-green-600'
                                                          }`}
                                                        >
                                                          <CheckIcon
                                                            className='h-5 w-5'
                                                            aria-hidden='true'
                                                          />
                                                        </span>
                                                      ) : null}
                                                    </>
                                                  )}
                                                </Combobox.Option>
                                              )
                                            )
                                          )}
                                        </Combobox.Options>
                                      </Transition>
                                    </div>
                                  </Combobox>

                                  <button
                                    onClick={handleNewTeamMemberSubmit}
                                    className='rounded-lg bg-green-600 px-3 font-medium text-white hover:bg-green-500 disabled:bg-gray-300'
                                    disabled={
                                      !selectedNewTeamLeader ||
                                      directReportsWithoutTeam.length === 0
                                    }
                                  >
                                    Ekle
                                  </button>
                                </Disclosure.Panel>
                              </div>
                            )}
                          </Disclosure>

                          <Disclosure>
                            {({ open }) => (
                              <div className='relative'>
                                <Disclosure.Button
                                  className={`${
                                    open ? 'rounded-t-lg' : 'rounded-lg'
                                  } flex w-full justify-between border border-gray-200 px-4 py-2 text-left font-medium focus:outline-none focus-visible:ring focus-visible:ring-black focus-visible:ring-opacity-75`}
                                >
                                  <div className='group inline-flex w-full items-center justify-between'>
                                    <span className='text-sm'>
                                      Ekip İsmini Değiştir
                                    </span>
                                    <div
                                      className={`inline-flex items-center gap-2 text-xs  ${
                                        open
                                          ? 'text-blue-600'
                                          : 'text-gray-400 group-hover:text-blue-500'
                                      } `}
                                    >
                                      <span className='font-medium'>
                                        <PencilSquareIcon className='h-5 w-5' />
                                      </span>
                                      <ChevronUpIcon
                                        className={`${
                                          open ? '' : 'rotate-180 transform'
                                        } h-5 w-5`}
                                      />
                                    </div>
                                  </div>
                                </Disclosure.Button>
                                <Disclosure.Panel className='absolute z-40 w-full rounded-b-lg border border-t-0 border-gray-200 bg-white p-5 pt-3 text-sm shadow-xl'>
                                  <form
                                    onSubmit={handleEditTeamName}
                                    className='flex flex-col gap-4'
                                  >
                                    <div className='relative mt-2 rounded-md '>
                                      <input
                                        id='username'
                                        name='username'
                                        type='text'
                                        required
                                        disabled={isLoading}
                                        pattern='^.{3,100}$'
                                        value={editTeamNameInput}
                                        onChange={(e) =>
                                          setEditTeamNameInput(e.target.value)
                                        }
                                        className='peer block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-0 disabled:text-gray-500 '
                                        placeholder=' '
                                      />
                                      <label
                                        htmlFor='username'
                                        className='absolute top-1 left-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-1 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-blue-500 '
                                      >
                                        Ekip İsmi
                                      </label>
                                    </div>
                                    <button
                                      // onClick={handleEditTeamName}
                                      type='submit'
                                      className='group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                    >
                                      Gönder
                                    </button>
                                  </form>
                                </Disclosure.Panel>
                              </div>
                            )}
                          </Disclosure>

                          <Popover className='relative w-full'>
                            {({ open }) => (
                              <>
                                <Popover.Button
                                  className={`
                                  rounded- group inline-flex w-full items-center justify-center gap-3 rounded-lg py-2 px-8 text-sm font-semibold   focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
                                  ${
                                    open
                                      ? 'bg-red-600 text-white'
                                      : 'text-red-600 hover:bg-red-50'
                                  }
                `}
                                >
                                  <span>Ekibi Sil</span>
                                  <TrashIcon className='h-5 w-5' />
                                </Popover.Button>
                                <Transition
                                  as={Fragment}
                                  enter='transition ease-out duration-200'
                                  enterFrom='opacity-0 translate-y-1'
                                  enterTo='opacity-100 translate-y-0'
                                  leave='transition ease-in duration-150'
                                  leaveFrom='opacity-100 translate-y-0'
                                  leaveTo='opacity-0 translate-y-1'
                                >
                                  <Popover.Panel className='absolute left-1/2 z-10 mt-3 w-full -translate-x-1/2 transform bg-red-50 text-red-800'>
                                    <div className='flex justify-between overflow-hidden rounded-lg px-3 py-3 text-sm  ring-1 ring-black ring-opacity-5'>
                                      <span className='px-2 font-medium'>
                                        Ekip silinecektir. <br /> Onaylıyor
                                        musunuz?
                                      </span>
                                      <button
                                        onClick={handleDeleteTeam}
                                        className='rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 '
                                      >
                                        Onayla
                                      </button>
                                    </div>
                                  </Popover.Panel>
                                </Transition>
                              </>
                            )}
                          </Popover>
                        </>
                      ) : null}
                      {selectedTeamId === 'new' ? (
                        <>
                          <h2 className='text-xl font-semibold '>Yeni Ekip</h2>
                          <form
                            onSubmit={handleNewTeamFormSubmit}
                            className='flex flex-col gap-6 text-sm'
                          >
                            <div className='relative flex flex-col gap-1 rounded-md '>
                              <label
                                htmlFor='newTeamName'
                                className='font-medium text-gray-500'
                              >
                                Ekip İsmi
                              </label>
                              <input
                                id='newTeamName'
                                name='newTeamName'
                                type='text'
                                required
                                disabled={isLoading}
                                pattern='^.{3,100}$'
                                value={newTeamNameInput}
                                onChange={(e) =>
                                  setNewTeamNameInput(e.target.value)
                                }
                                className='peer block w-full appearance-none rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-0 disabled:text-gray-500 '
                                placeholder=' '
                              />
                            </div>
                            <div className='flex flex-col gap-1'>
                              <label className='font-medium text-gray-500'>
                                Ekip Lideri
                              </label>
                              <Combobox
                                value={selectedNewTeamLeader}
                                onChange={setSelectedNewTeamLeader}
                              >
                                <div className='relative'>
                                  <div className='relative w-full cursor-default overflow-hidden rounded-lg border border-gray-200 bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-green-300 sm:text-sm'>
                                    <Combobox.Input
                                      className='w-full border-none py-3 pl-4 pr-10 text-sm leading-5 text-gray-900 outline-none focus:ring-0'
                                      displayValue={(user) => user.display_name}
                                      onChange={(event) =>
                                        setSelectboxSearchQuery(
                                          event.target.value
                                        )
                                      }
                                    />
                                    <Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>
                                      <ChevronUpDownIcon
                                        className='h-5 w-5 text-gray-400'
                                        aria-hidden='true'
                                      />
                                    </Combobox.Button>
                                  </div>
                                  <Transition
                                    as={Fragment}
                                    leave='transition ease-in duration-100'
                                    leaveFrom='opacity-100'
                                    leaveTo='opacity-0'
                                    afterLeave={() =>
                                      setSelectboxSearchQuery('')
                                    }
                                  >
                                    <Combobox.Options className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                                      {filteredDirectReportsWithoutTeam.length ===
                                        0 && selectboxSearchQuery !== '' ? (
                                        <div className='relative cursor-default select-none py-2 px-4 text-gray-700'>
                                          Personel bulunamadı.
                                        </div>
                                      ) : (
                                        filteredDirectReportsWithoutTeam.map(
                                          (user) => (
                                            <Combobox.Option
                                              key={user.username}
                                              className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                  active
                                                    ? 'bg-green-600 text-white'
                                                    : 'text-gray-900'
                                                }`
                                              }
                                              value={user}
                                            >
                                              {({ selected, active }) => (
                                                <>
                                                  <span
                                                    className={`block truncate ${
                                                      selected
                                                        ? 'font-medium'
                                                        : 'font-normal'
                                                    }`}
                                                  >
                                                    {user.display_name}
                                                  </span>
                                                  {selected ? (
                                                    <span
                                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                        active
                                                          ? 'text-white'
                                                          : 'text-green-600'
                                                      }`}
                                                    >
                                                      <CheckIcon
                                                        className='h-5 w-5'
                                                        aria-hidden='true'
                                                      />
                                                    </span>
                                                  ) : null}
                                                </>
                                              )}
                                            </Combobox.Option>
                                          )
                                        )
                                      )}
                                    </Combobox.Options>
                                  </Transition>
                                </div>
                              </Combobox>
                            </div>
                            <div className='mt-4'>
                              {isLoading ? (
                                <div className='flex w-full justify-center text-center '>
                                  <Loader size={8} />
                                </div>
                              ) : (
                                <button
                                  // onClick={handleNewTeamFormSubmit}
                                  type='submit'
                                  className='relativeflex group w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-base font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                >
                                  Gönder
                                </button>
                              )}
                            </div>
                          </form>
                        </>
                      ) : null}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
