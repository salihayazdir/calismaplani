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
} from '@heroicons/react/24/outline';

export default function ManagerUserTable({
  listOfUsers,
  records,
  selectedDate,
  authorizedPersonnel,
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
      const didSendRecords = Boolean(
        records.find(({ username }) => username === manager.username)
      );

      const authorizedDirectReports = authorizedPersonnel
        .map((user) => {
          if (user.manager_username === manager.username) return user.username;
        })
        .filter((username) => username !== undefined);

      const numberOfAuthorizedDirectReports = authorizedDirectReports.length;

      return {
        ...manager,
        didSendRecords,
        numberOfAuthorizedDirectReports,
        subRows: listOfUsers
          .filter((user) => user.manager_username === manager.username)
          .map((user) => ({
            display_name: user.display_name,
            username: user.username,
            mail: user.mail,
            isAuthorizedPersonnel: Boolean(
              authorizedDirectReports.indexOf(user.username) !== -1
            ),
          })),
      };
    });
  }, []);

  const getBulkReminderMailList = () => {
    const mailsOfAuthorizedPersonnelWithoutRecords = tableData
      .filter((manager) => !manager.didSendRecords)
      .map((manager) =>
        manager.subRows
          .filter((personnel) => personnel.isAuthorizedPersonnel)
          .map((user) => user.mail)
      )
      .flat(Infinity);

    const mailsOfManagersWithoutRecord = tableData
      .filter((manager) => !manager.didSendRecords)
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
      (directReport) => directReport.isAuthorizedPersonnel
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
        Header: 'Yönetici İsmi',
        accessor: 'display_name',
        Cell: ({ row }) => {
          const value = row.values.display_name;
          return (
            <span
              className={`font-medium  ${
                row.depth === 0 ? 'text-gray-700' : 'font-light text-gray-500'
              }`}
            >
              {value === undefined || value === null ? null : String(value)}
            </span>
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
      {
        Header: '',
        accessor: 'isAuthorizedPersonnel',
        Cell: ({ value }) =>
          value ? (
            <div className=' inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-0.5 text-center text-green-700 outline outline-1 outline-green-400'>
              <span>Yetkili</span>
              <CheckIcon className='h-4 w-4  ' />
            </div>
          ) : null,
      },
      {
        Header: 'Yetkili Personel',
        accessor: 'numberOfAuthorizedDirectReports',
        Cell: ({ value }) =>
          value > 0 ? (
            <div className=' inline-flex items-center rounded-full bg-green-100 px-4 py-1 text-center font-bold text-green-700 '>
              {String(value)}
            </div>
          ) : null,
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
        Header: 'GMY',
        accessor: 'manager_display_name',
        Cell: ({ value }) => (
          <span className=' text-gray-500'>
            {' '}
            {value === undefined || value === null ? null : String(value)}
          </span>
        ),
      },
      {
        Header: 'Kayıtlar',
        accessor: 'didSendRecords',
        Cell: ({ value }) => {
          if (value)
            return (
              <div className='flex w-24 items-center  justify-between gap-2 rounded-md border border-green-400 bg-green-200 px-2 py-[3px] text-green-700 '>
                <span>Gönderdi</span>
                <CheckIcon className='h-4 w-4' />
              </div>
            );
          if (value === false)
            return (
              <div className='flex w-24 items-center  justify-between gap-2 rounded-md border border-red-400 bg-red-200 px-2 py-[3px] text-red-700 '>
                <span>Eksik</span>
                <XMarkIcon className='h-4 w-4' />
              </div>
            );
        },
      },
    ],
    []
  );

  const emailColumn = {
    id: 'reminder',
    Header: 'E-Posta Bildirimi',
    Cell: ({ row }) => {
      if (row.values.didSendRecords === false)
        return (
          <button
            onClick={() => {
              setManagerMailProps({
                username: row.values.username,
                name: row.values.display_name,
                mail: row.values.mail,
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
      if (row.values.didSendRecords === true)
        return (
          <button
            onClick={() => {
              setManagerMailProps({
                username: row.values.username,
                name: row.values.display_name,
                mail: row.values.mail,
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
  };

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [...columns, emailColumn]);
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
      initialState: { hiddenColumns: ['username', 'mail'] },
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
