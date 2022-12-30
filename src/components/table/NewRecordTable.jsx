import { useMemo, useRef, forwardRef, useEffect } from 'react';
import { useTable, useRowSelect } from 'react-table';
import StatusSelect from './StatusSelect';
import NewRecordBulkActions from './NewRecordBulkActions';
import { addDays, format } from 'date-fns';
import { CheckIcon } from '@heroicons/react/24/outline';
import _ from 'lodash';

const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;
  IndeterminateCheckbox.displayName = 'IndeterminateCheckbox';
  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return (
    <>
      <input type='checkbox' ref={resolvedRef} {...rest} />
    </>
  );
});

export default function NewRecordTable({
  newRecords,
  setNewRecords,
  userStatuses,
  selectedDate,
  authorizedPersonnel,
}) {
  const tableData = useMemo(
    () =>
      _.sortBy(
        newRecords[0].data.map((user) => ({
          username: user.username,
          display_name: user.display_name,
          user_status_id: user.user_status_id,
          isAuthorized: Boolean(
            authorizedPersonnel.indexOf(user.username) !== -1
          ),
        })),
        'display_name'
      ),
    [selectedDate, authorizedPersonnel]
  );

  const columns = useMemo(
    () => [
      {
        Header: '',
        id: 'index',
        maxWidth: 40,
        width: 20,
        accessor: (_row, i) => i + 1,
        Cell: ({ value }) => (
          <span className='font-medium text-gray-400'>
            {value === undefined ? null : String(value + '.')}
          </span>
        ),
      },
      {
        Header: 'Personel',
        accessor: 'display_name',
        Cell: ({ value }) => (
          <span className=' font-medium text-gray-800'>
            {value === undefined ? null : String(value)}
          </span>
        ),
      },
      {
        Header: 'Yetki',
        accessor: 'isAuthorized',
        Cell: ({ value }) => {
          if (value === true)
            return (
              <div className='inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-center text-green-700 outline outline-1 outline-green-400'>
                <span>Yetkili</span>
                <CheckIcon className='h-4 w-4  ' />
              </div>
            );
        },
      },
      {
        Header: '',
        accessor: 'username',
      },
    ],
    [newRecords, selectedDate]
  );

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  const selectBoxColumns = days.map((dayName, dayIdx) => ({
    id: dayIdx,
    Header: () => {
      const day = addDays(selectedDate, dayIdx);
      const formattedDay = format(day, 'd MMMM');
      return (
        <div className='inline-flex w-full items-center gap-4'>
          <div>{dayName}</div>
          <div className='rounded-lg text-gray-400'>{formattedDay}</div>
        </div>
      );
    },
    Cell: ({ row }) => {
      return (
        <StatusSelect
          selectedId={
            newRecords
              .filter((newRecords) => newRecords.dayIdx === dayIdx)[0]
              .data.filter(
                (record) => record.username === row.values.username
              )[0].user_status_id
          }
          setNewRecords={setNewRecords}
          userStatuses={userStatuses}
          username={row.values.username}
          day={dayIdx}
        />
      );
    },
  }));

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      {
        id: 'selection',
        maxWidth: 40,
        width: 20,
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <div className='flex items-center'>
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          </div>
        ),
        Cell: ({ row }) => (
          <div className='flex items-center'>
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          </div>
        ),
      },
      ...columns,
      ...selectBoxColumns,
    ]);
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    toggleAllRowsSelected,
    state: { selectedRowIds },
  } = useTable(
    {
      columns,
      data: tableData,
      initialState: { hiddenColumns: ['username'] },
    },
    useRowSelect,
    tableHooks
  );

  return (
    <div className='flex flex-col rounded-xl border  border-gray-200 bg-white pb-4'>
      <div className='flex items-center justify-between p-4'>
        <h2 className='inline-flex gap-2 whitespace-nowrap rounded-md bg-green-50 px-4 py-2 text-sm font-bold text-green-600 '>
          {`
        ${format(selectedDate, 'd MMMM')}  -  ${format(
            addDays(selectedDate, 4),
            'd MMMM yyyy'
          )}`}
        </h2>
        <NewRecordBulkActions
          newRecords={newRecords}
          setNewRecords={setNewRecords}
          userStatuses={userStatuses}
          selectedFlatRows={selectedFlatRows}
          numberOfSelectedRows={Object.keys(selectedRowIds).length}
          toggleAllRowsSelected={toggleAllRowsSelected}
        />
      </div>
      <div className={`overflow-x-auto text-xs`}>
        <table
          {...getTableProps()}
          className='w-full border-collapse rounded-lg '
        >
          <thead className='border-y border-gray-200 bg-gray-50'>
            {headerGroups.map((headerGroup, idx) => (
              <tr key={idx} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, idx) => (
                  <th
                    key={idx}
                    {...column.getHeaderProps({
                      style: { minWidth: column.minWidth, width: column.width },
                    })}
                    className='whitespace-nowrap px-3 py-3 text-left font-semibold first-of-type:pl-6'
                  >
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className='text-gray-800 '>
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
                        {...cell.getCellProps({
                          style: {
                            minWidth: cell.column.minWidth,
                            width: cell.column.width,
                          },
                        })}
                        className='w-44 py-4 pl-3 pr-5 first-of-type:w-20 first-of-type:pl-6 '
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
    </div>
  );
}
