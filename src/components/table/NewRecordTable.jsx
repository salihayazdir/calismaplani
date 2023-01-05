import { useMemo, useRef, forwardRef, useEffect } from 'react';
import { useTable, useRowSelect, useFilters } from 'react-table';
import StatusSelect from './StatusSelect';
import NewRecordBulkActions from './NewRecordBulkActions';
import { addDays, format } from 'date-fns';
import { CheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import _ from 'lodash';
import Loader from '../skeletons/Loader';

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
  prevRecordsExist,
  fillWithPreviousRecords,
  tableIsFilledWithPreviousRecords,
  apiStatus,
}) {
  const filterTypes = useMemo(
    () => ({
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const defaultColumn = useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const tableData = useMemo(
    () =>
      _.sortBy(
        newRecords[0].data.map((user) => ({
          username: user.username,
          display_name: user.display_name,
          physicalDeliveryOfficeName: user.physicalDeliveryOfficeName,
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
        Filter: false,
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
        Filter: false,
        maxWidth: 40,
        width: 20,
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
        Header: 'Servis',
        accessor: 'physicalDeliveryOfficeName',
        Filter: SelectColumnFilter,
        Cell: ({ value }) => (
          <span className='font-light text-gray-400'>
            {value === undefined || value === null ? null : String(value)}
          </span>
        ),
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
        <div className='w-20 '>
          <div>{dayName}</div>
          <div className='mt-2 rounded-lg text-gray-400'>{formattedDay}</div>
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
      defaultColumn,
      filterTypes,
      initialState: { hiddenColumns: ['username'] },
    },
    useFilters,
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
        <div className='flex items-center justify-end gap-6'>
          {apiStatus.isLoading ? (
            <div className='flex items-center gap-4'>
              <span className='whitespace-nowrap text-xs font-light text-gray-400'>
                Geçmiş kayıtlar yükleniyor...
              </span>
              <Loader size='6' />
            </div>
          ) : null}
          {prevRecordsExist && !apiStatus.isLoading ? (
            <div className='inline-flex items-center gap-4 whitespace-nowrap rounded-md bg-orange-50 pl-4 text-xs text-orange-700 '>
              <div>
                <span>
                  <ExclamationCircleIcon className='h-4 w-4' />
                </span>
              </div>
              <span>Seçilen tarih aralığı için mevcut kayıt bulunuyor.</span>
              <button
                onClick={() => fillWithPreviousRecords()}
                disabled={tableIsFilledWithPreviousRecords}
                className={`rounded-md bg-orange-700 px-3 py-2 font-bold text-orange-50 hover:bg-orange-600 disabled:bg-gray-300 disabled:text-white `}
              >
                {/* {tableIsFilledWithPreviousRecords ? (
                  <span className='flex w-full flex-col items-center'>
                    <CheckIcon className='h-4 w-4 text-green-600' />
                  </span>
                ) : (
                  'Getir'
                )} */}
                Geçmiş Kayıtları Tabloya Getir
              </button>
            </div>
          ) : null}
          <NewRecordBulkActions
            newRecords={newRecords}
            setNewRecords={setNewRecords}
            userStatuses={userStatuses}
            selectedFlatRows={selectedFlatRows}
            numberOfSelectedRows={Object.keys(selectedRowIds).length}
            toggleAllRowsSelected={toggleAllRowsSelected}
          />
        </div>
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
                    // className='whitespace-nowrap px-3 py-3 text-left font-semibold first-of-type:pl-6'
                    className='px-3 py-2 text-left align-baseline font-semibold first-of-type:pl-6 first-of-type:align-middle'
                  >
                    {column.render('Header')}
                    <div>
                      {column.canFilter ? column.render('Filter') : null}
                    </div>
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

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  // const count = preFilteredRows.length;
  return (
    <input
      className='mt-1 w-40 rounded-md py-1 px-2 text-gray-500 shadow focus:outline-blue-300'
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      placeholder={`Ara...`}
    />
  );
}

function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  const options = useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  return (
    <select
      className='mt-1 w-40 rounded-md py-1 px-2 text-gray-500 shadow focus:outline-blue-300'
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value=''>Tümü</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
