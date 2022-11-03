import { useMemo, useState } from 'react';
import { useTable, useExpanded } from 'react-table';
import ManagerMailModal from '../modals/ManagerMailModal';
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
}) {
  const [managerMailModalIsOpen, setManagerMailModalIsOpen] = useState(false);
  const [managerMailProps, setManagerMailProps] = useState({
    name: null,
    mail: null,
    type: null,
  });

  const tableData = useMemo(() => {
    const managers = listOfUsers.filter((user) => user.is_manager);
    return managers.map((manager) => {
      const didSendRecords = Boolean(
        records.find(
          ({ manager_username }) => manager_username === manager.username
        )
      );
      return {
        ...manager,
        didSendRecords,
        subRows: listOfUsers
          .filter((user) => user.manager_username === manager.username)
          .map((user) => ({
            display_name: user.display_name,
            username: user.username,
          })),
      };
    });
  }, []);

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
              {value === undefined ? null : String(value)}
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
        Header: 'Bölüm',
        accessor: 'description',
        Cell: ({ value }) => (
          <span className=' text-gray-500'>
            {value === undefined ? null : String(value)}
          </span>
        ),
      },
      {
        Header: 'GMY',
        accessor: 'manager_display_name',
        Cell: ({ value }) => (
          <span className=' text-gray-500'>
            {' '}
            {value === undefined ? null : String(value)}
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
      <ManagerMailModal
        isOpen={managerMailModalIsOpen}
        setIsOpen={setManagerMailModalIsOpen}
        managerMailProps={managerMailProps}
        selectedDate={selectedDate}
      />
    </>
  );
}
