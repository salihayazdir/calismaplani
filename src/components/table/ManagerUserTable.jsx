import { useMemo } from 'react';
import { useTable, useExpanded } from 'react-table';
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon,
  EnvelopeIcon,
} from '@heroicons/react/20/solid';

export default function ManagerUserTable({ listOfUsers, records }) {
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
        subRows: listOfUsers.filter(
          (user) => user.manager_username === manager.username
        ),
      };
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'expander',
        Header: '',
        //  ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
        //   <span {...getToggleAllRowsExpandedProps()}>
        //     {isAllRowsExpanded ? (
        //       <ChevronDownIcon className='h-6 w-6' />
        //     ) : (
        //       <ChevronRightIcon className='h-6 w-6' />
        //     )}
        //   </span>
        // ),
        Cell: ({ row }) =>
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          row.canExpand ? (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  // We can even use the row.depth property
                  // and paddingLeft to indicate the depth
                  // of the row
                  paddingLeft: `${row.depth * 5}rem`,
                },
              })}
            >
              {row.isExpanded ? (
                <ChevronDownIcon className='h-6 w-6' />
              ) : (
                <ChevronRightIcon className='h-6 w-6' />
              )}
            </span>
          ) : null,
      },
      {
        Header: 'Yönetici İsmi',
        accessor: 'display_name',
      },
      {
        Header: 'username',
        accessor: 'username',
      },
      {
        Header: 'Bölüm',
        accessor: 'description',
      },
      {
        Header: 'GMY',
        accessor: 'manager_display_name',
      },
      {
        Header: 'Kayıt',
        accessor: 'didSendRecords',
        Cell: ({ value }) => {
          if (value)
            return (
              <CheckIcon className='h-8 w-8 rounded-md bg-green-500 p-1 text-green-100 ' />
            );
          if (value === false)
            return (
              <XMarkIcon className='h-8 w-8 rounded-md bg-red-500 p-1 text-red-100' />
            );
        },
      },
    ],
    []
  );

  const statusColumn = {
    id: 'reminder',
    Header: 'Hatırlatma',
    Cell: ({ row }) => {
      if (row.values.didSendRecords === false)
        return (
          <button className='flex items-center gap-2 rounded-md  bg-gray-500 py-1 px-3 font-semibold text-gray-50'>
            <span>Hatırlat</span>
            <EnvelopeIcon className='h-5 w-5' />
          </button>
        );
      if (row.values.didSendRecords === true)
        return (
          <button className='flex items-center gap-2 rounded-md border border-gray-200 bg-gray-100 py-1 px-3 font-semibold text-gray-600'>
            <span>Düzenleme İste</span>
            <EnvelopeIcon className='h-5 w-5' />
          </button>
        );
    },
  };

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [...columns, statusColumn]);
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
      initialState: { hiddenColumns: ['username'] },
    },
    useExpanded,
    tableHooks
  );

  return (
    <div className={`overflow-x-auto overflow-y-visible text-xs`}>
      <table {...getTableProps()} className='w-full border-collapse rounded-lg'>
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
  );
}
