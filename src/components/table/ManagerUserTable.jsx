import { useMemo, useState } from 'react';
import { useTable, useExpanded } from 'react-table';
import ManagerMailModal from '../modals/ManagerMailModal';
import { format, addDays } from 'date-fns';
import BulkManagerMailModal from '../modals/BulkManagerMailModal';
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon,
  EnvelopeIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export default function ManagerUserTable({
  listOfUsers,
  records,
  selectedDate,
}) {
  const [bulkManagerMailModalIsOpen, setBulkManagerMailModalIsOpen] =
    useState(false);
  const [managerMailModalIsOpen, setManagerMailModalIsOpen] = useState(false);
  const [managerMailProps, setManagerMailProps] = useState({
    username: null,
    name: null,
    mail: null,
    type: null,
  });

  const tableData = useMemo(() => {
    const managers = listOfUsers.filter((user) => user.is_manager);
    return managers.map((manager) => {
      const hasRecord = Boolean(
        records.find(({ username }) => username === manager.username)
      );

      const numberOfDirectReports = listOfUsers.filter(
        (user) => user.manager_username === manager.username
      ).length;

      const authorizedDirectReports = listOfUsers.filter((user) => {
        if (
          user.manager_username === manager.username &&
          user.is_authorized === true
        )
          return user.username;
      });

      const numberOfAuthorizedDirectReports = authorizedDirectReports.length;
      const numberOfTeams = listOfUsers.filter(
        (user) =>
          user.manager_username === manager.username && user.is_leader === true
      ).length;

      const recordCompletionPercentage = (
        (100 *
          records.filter(
            (record) =>
              record.manager_username === manager.username ||
              record.username === manager.username
          ).length) /
        5 /
        (listOfUsers.filter(
          (user) => user.manager_username === manager.username
        ).length +
          1)
      ).toFixed(0);

      return {
        ...manager,
        hasRecord,
        numberOfAuthorizedDirectReports,
        numberOfTeams,
        numberOfDirectReports,
        recordCompletionPercentage,
        subRows: listOfUsers
          .filter((user) => user.manager_username === manager.username)
          .map((user) => {
            const hasRecord = Boolean(
              records.find(({ username }) => username === user.username)
            );

            let leaderRecordCompletionPercentage = null;
            if (user.is_leader === true) {
              leaderRecordCompletionPercentage = (
                (100 *
                  records.filter(
                    (record) => record.leader_username === user.username
                  ).length) /
                5 /
                listOfUsers.filter(
                  (member) => member.leader_username === user.username
                ).length
              ).toFixed(0);
            }

            return {
              display_name: user.display_name,
              username: user.username,
              mail: user.mail,
              is_authorized: user.is_authorized,
              is_leader: user.is_leader,
              is_manager: false,
              team_display_name: user.team_display_name,
              leaderRecordCompletionPercentage,
              hasRecord,
            };
          }),
      };
    });
  }, []);

  const getBulkReminderMailList = () => {
    const mailsOfAuthorizedPersonnelWithoutRecords = tableData
      .filter((manager) => !manager.hasRecord)
      .map((manager) =>
        manager.subRows
          .filter((personnel) => personnel.is_authorized)
          .map((user) => user.mail)
      )
      .flat(Infinity);

    const mailsOfManagersWithoutRecord = tableData
      .filter((manager) => !manager.hasRecord)
      .map((manager) => manager.mail);

    return [
      ...mailsOfManagersWithoutRecord,
      ...mailsOfAuthorizedPersonnelWithoutRecords,
    ];
  };

  const getAuthorizedPersonnelMailListByManager = () => {
    const managerDataArray = tableData.filter(
      (manager) => manager.username === managerMailProps.username
    );
    if (managerDataArray.length !== 1) return [];
    const managerData = managerDataArray[0];

    if (managerData.numberOfAuthorizedDirectReports < 1) return [];

    const authorizedDirectReports = managerData.subRows.filter(
      (directReport) => directReport.is_authorized
    );
    const authorizedDirectReportsMails = authorizedDirectReports.map(
      (directReport) => directReport.mail
    );

    return [...authorizedDirectReportsMails];
  };

  const columns = useMemo(
    () => [
      {
        id: 'expander',
        Header: '',
        Cell: ({ row }) =>
          row.canExpand ? (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  paddingLeft: `${row.depth * 5}rem`,
                },
              })}
            >
              {row.isExpanded ? (
                <ChevronDownIcon className='h-5 w-5' />
              ) : (
                <ChevronRightIcon className='h-5 w-5' />
              )}
            </span>
          ) : null,
      },
      {
        Header: 'Personel',
        accessor: 'display_name',
        Cell: ({ row }) => {
          const value = row.values.display_name;
          return (
            <div className='flex items-center gap-4'>
              {row.original.hasRecord === true ? (
                <div className='mr-2 h-2 w-2  rounded-full bg-green-500'></div>
              ) : (
                <div className='mr-2 h-2 w-2  rounded-full bg-red-500 '></div>
              )}
              <span
                className={`font-medium  ${
                  row.depth === 0 ? 'text-gray-700' : 'font-light text-gray-500'
                }`}
              >
                {value === undefined || value === null ? null : String(value)}
              </span>
              {row.original.is_authorized ? (
                <div className=' inline-flex items-center gap-2 rounded-full bg-green-100 px-2 py-0.5 text-center text-green-700 outline outline-1 outline-green-400'>
                  <span>Yetkili</span>
                  <CheckIcon className='h-4 w-4  ' />
                </div>
              ) : null}
              {row.original.is_leader ? (
                <div className='inline-flex items-center gap-2 rounded-full bg-sky-100 px-2 py-0.5 text-center text-sky-700 outline outline-1 outline-sky-400'>
                  <span>Lider</span>
                  <UserGroupIcon className='h-4 w-4  ' />
                </div>
              ) : null}
              {row.original.is_manager &&
              row.original.numberOfDirectReports > 0 ? (
                <div className='inline-flex items-center gap-2 rounded-full bg-gray-100 px-2 py-0.5 text-center text-gray-700 outline outline-1 outline-gray-200'>
                  <span>{row.original.numberOfDirectReports}</span>
                  <UserIcon className='h-3 w-3  ' />
                </div>
              ) : null}
              {row.original.is_manager &&
              row.original.numberOfAuthorizedDirectReports > 0 ? (
                <div className='inline-flex items-center gap-2 rounded-full bg-green-100 px-2 py-0.5 text-center text-green-700 outline outline-1 outline-green-400'>
                  <span>{row.original.numberOfAuthorizedDirectReports}</span>
                  <CheckIcon className='h-4 w-4  ' />
                </div>
              ) : null}
              {row.original.is_manager && row.original.numberOfTeams > 0 ? (
                <div className='inline-flex items-center gap-2 rounded-full bg-sky-100 px-2 py-0.5 text-center text-sky-700 outline outline-1 outline-sky-400'>
                  <span>{row.original.numberOfTeams}</span>
                  <UserGroupIcon className='h-4 w-4  ' />
                </div>
              ) : null}
            </div>
          );
        },
      },
      {
        Header: 'username',
        accessor: 'username',
      },
      {
        Header: 'mail',
        accessor: 'mail',
      },
      // {
      //   Header: 'Yetkili Personel',
      //   accessor: 'numberOfAuthorizedDirectReports',
      //   Cell: ({ value }) =>
      //     value > 0 ? (
      //       <div className=' inline-flex items-center rounded-full bg-green-100 px-4 py-1 text-center font-bold text-green-700 '>
      //         {String(value)}
      //       </div>
      //     ) : null,
      // },
      {
        Header: 'Ekip',
        accessor: 'team_display_name',
        Cell: ({ value }) => (
          <span className=' text-gray-500'>
            {value === undefined || value === null ? null : String(value)}
          </span>
        ),
      },
      {
        Header: 'Bölüm',
        accessor: 'description',
        Cell: ({ value }) => (
          <span className=' text-gray-500'>
            {value === undefined || value === null ? null : String(value)}
          </span>
        ),
      },
      {
        Header: 'Yönetici',
        accessor: 'manager_display_name',
        Cell: ({ value }) => (
          <span className=' text-gray-500'>
            {value === undefined || value === null ? null : String(value)}
          </span>
        ),
      },
      {
        Header: 'Kayıt Oranı',
        accessor: 'recordCompletionPercentage',
        Cell: ({ row }) => {
          let percentage;
          if (row.original.is_leader) {
            percentage = row.original.leaderRecordCompletionPercentage;
          } else {
            percentage = row.original.recordCompletionPercentage;
          }

          let styles;
          if (percentage === undefined || percentage === null) return null;
          if (percentage == 0) {
            styles = ' bg-red-100 text-red-700';
          } else if (percentage == 100) {
            styles = ' bg-green-100 text-green-700';
          } else {
            styles = ' bg-yellow-100 text-yellow-700';
          }

          return (
            <div
              className={`flex w-16 items-center justify-center gap-2 rounded-md px-2 py-1 font-semibold
            ${styles} `}
            >
              {`% ${percentage}`}
            </div>
          );
        },
      },
      {
        Header: 'Kayıtlar',
        accessor: 'hasRecord',
        // Cell: ({ value }) => {
        //   if (value === true)
        //     return (
        //       <div className='h-2 w-2 rounded-full  bg-green-500 shadow-md shadow-green-300 '></div>
        //     );
        //   else
        //     return (
        //       <div className='h-2 w-2 rounded-full  bg-red-500 shadow-sm shadow-red-300 '></div>
        //     );
        // },
      },
      {
        id: 'reminder',
        Header: 'E-Posta Bildirimi',
        Cell: ({ row }) => {
          if (
            row.original.is_leader !== true &&
            row.original.is_manager !== true
          )
            return null;

          if (
            row.original.recordCompletionPercentage !== '100' &&
            row.original.leaderRecordCompletionPercentage !== '100'
          )
            return (
              <button
                onClick={() => {
                  setManagerMailProps({
                    username: row.original.username,
                    name: row.original.display_name,
                    mail: row.original.mail,
                    type: 'reminder',
                  });
                  setManagerMailModalIsOpen(true);
                }}
                className='inline-flex items-center gap-2 rounded-md bg-gray-100 py-1 px-3 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              >
                <EnvelopeIcon className='h-5 w-5' />
                <span className=''>Hatırlat</span>
              </button>
            );
          else
            return (
              <button
                onClick={() => {
                  setManagerMailProps({
                    username: row.original.username,
                    name: row.original.display_name,
                    mail: row.original.mail,
                    type: 'edit',
                  });
                  setManagerMailModalIsOpen(true);
                }}
                className='flex items-center gap-2 rounded-md py-1 px-3 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              >
                <EnvelopeIcon className='h-5 w-5' />
                <span className=''>Düzenleme İste</span>
              </button>
            );
        },
      },
    ],
    []
  );

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [...columns]);
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { expanded },
  } = useTable(
    {
      columns,
      data: tableData,
      initialState: { hiddenColumns: ['username', 'mail', 'hasRecord'] },
    },
    useExpanded,
    tableHooks
  );

  return (
    <>
      <div className={`overflow-x-auto overflow-y-visible text-xs`}>
        <div className='flex w-full items-center justify-between px-4 pb-4'>
          <h2 className='inline-flex gap-2 whitespace-nowrap rounded-md bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 '>
            {`
        ${format(selectedDate, 'd MMMM')}  -  ${format(
              addDays(selectedDate, 4),
              'd MMMM yyyy'
            )}`}
          </h2>
          <button
            onClick={() => setBulkManagerMailModalIsOpen(true)}
            className='flex-end inline-flex gap-3 rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-md  hover:bg-blue-600 '
          >
            <span>{'Tümüne Hatırlat'}</span>
            <span>
              <EnvelopeIcon className='h-5 w-5' />
            </span>
          </button>
        </div>

        <table
          {...getTableProps()}
          className='w-full border-collapse rounded-lg'
        >
          <thead className='border-y border-gray-200 bg-gray-50'>
            {headerGroups.map((headerGroup, idx) => (
              <tr key={idx} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, idx) => (
                  <th
                    key={idx}
                    {...column.getHeaderProps()}
                    className='whitespace-nowrap px-3 py-3 text-left align-bottom font-semibold first-of-type:pl-4'
                  >
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className='text-gray-800'>
            {rows.map((row, idx) => {
              prepareRow(row);
              return (
                <tr
                  key={idx}
                  {...row.getRowProps()}
                  className='border-b border-gray-200'
                >
                  {row.cells.map((cell, idx) => {
                    return (
                      <td
                        key={idx}
                        {...cell.getCellProps()}
                        className='py-2 px-3 first-of-type:pl-4 '
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {managerMailModalIsOpen ? (
        <ManagerMailModal
          isOpen={managerMailModalIsOpen}
          setIsOpen={setManagerMailModalIsOpen}
          managerMailProps={managerMailProps}
          selectedDate={selectedDate}
          authorizedPersonnelMailList={getAuthorizedPersonnelMailListByManager()}
        />
      ) : null}
      {bulkManagerMailModalIsOpen ? (
        <BulkManagerMailModal
          isOpen={bulkManagerMailModalIsOpen}
          setIsOpen={setBulkManagerMailModalIsOpen}
          selectedDate={selectedDate}
          mailList={getBulkReminderMailList()}
        />
      ) : null}
    </>
  );
}
