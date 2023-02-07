import { useMemo, useState } from 'react';
import { useTable, useFilters, usePagination } from 'react-table';
import { addDays, format } from 'date-fns';
import * as XLSX from 'xlsx';
import _ from 'lodash';
import {
  ArrowDownTrayIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import EditRecordsModal from '../modals/EditRecordsModal';

export default function DashboardTable({
  records,
  userStatuses,
  selectedDate,
  isDashboard,
  fetchTableData,
}) {
  const [editRecordsModalIsOpen, setEditRecordsModalIsOpen] = useState(false);
  const [userDataForEditRecordsModal, setUserDataForEditRecordsModal] =
    useState({
      description: '',
      display_name: '',
      index: null,
      manager_display_name: '',
      physicalDeliveryOfficeName: '',
      username: '',
    });

  const getStatusContainerStyles = (statusId) => {
    switch (statusId) {
      case 1:
        return 'bg-green-100 text-green-700 border border-green-300';
        break;
      case 2:
        return 'bg-sky-100 text-sky-700 border border-sky-300';
        break;
      case 3:
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
        break;
      default:
        return 'bg-red-100 text-red-700 border border-red-300';
    }
  };

  const removeDuplicateObjects = (arr, fn) => {
    var seen = {};
    return arr.filter((item) => {
      var k = fn(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  };

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

  const tableData = useMemo(() => {
    const usersInRecords = records.map((record) => ({
      display_name: record.display_name,
      manager_display_name: record.manager_display_name,
      username: record.username,
      manager_username: record.manager_username,
      department: record.department,
      description: record.description,
      physicalDeliveryOfficeName: record.physicalDeliveryOfficeName,
    }));
    const uniqUsersInRecords = removeDuplicateObjects(
      usersInRecords,
      JSON.stringify
    );
    return _.sortBy(uniqUsersInRecords, 'display_name');
  }, [records]);

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
          <span className=' font-medium text-gray-700'>{String(value)}</span>
        ),
      },
      {
        Header: 'username',
        accessor: 'username',
      },
      {
        Header: 'Yönetici',
        accessor: 'manager_display_name',
        Cell: ({ value }) => {
          return value ? (
            <span className=' text-gray-500'>{String(value)}</span>
          ) : null;
        },
      },
      // {
      //   Header: 'Departman',
      //   accessor: 'department',
      // },
      {
        Header: 'Bölüm',
        accessor: 'description',
        Filter: SelectColumnFilter,
        Cell: ({ value }) => {
          return value ? (
            <span className=' text-gray-500'>{String(value)}</span>
          ) : null;
        },
      },
      {
        Header: 'Servis',
        accessor: 'physicalDeliveryOfficeName',
        Filter: SelectColumnFilter,
        Cell: ({ value }) => {
          return value ? (
            <span className=' text-gray-500'>{String(value)}</span>
          ) : null;
        },
      },
    ],
    []
  );

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  const statusColumns = days.map((dayName, dayIdx) => ({
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
      const day = addDays(selectedDate, dayIdx);
      const formattedDay = format(day, 'yyyy-MM-dd');
      const filteredRecord = records.filter(
        (record) =>
          record.record_date.slice(0, 10) == formattedDay &&
          record.username == row.values.username
      );
      if (filteredRecord.length !== 1) return null;
      if (!filteredRecord[0].user_status_id) return null;
      const statusId = filteredRecord[0].user_status_id;
      const userStatusObject = userStatuses.filter(
        (userStatus) => userStatus.user_status_id == statusId
      );
      const containerStyles = getStatusContainerStyles(
        userStatusObject[0].user_status_id
      );
      const status = userStatusObject[0].user_status_name;
      return (
        <div className={`rounded-full py-[2px] text-center ${containerStyles}`}>
          {status}
        </div>
      );
    },
  }));

  const editRecordsColumn = {
    Header: 'Düzenle',
    accessor: 'edit',
    maxWidth: 40,
    width: 20,
    Filter: false,
    Cell: ({ row }) => {
      return row.values.username ? (
        <button
          onClick={() => handleEditRecordButton(row.values)}
          className='flex items-center justify-center gap-1 rounded-md p-1 text-blue-600 hover:bg-blue-50'
        >
          <PencilSquareIcon className='h-5 w-5' />
        </button>
      ) : null;
    },
  };

  const handleEditRecordButton = (userValues) => {
    console.log(userValues);
    setUserDataForEditRecordsModal(userValues);
    setEditRecordsModalIsOpen(true);
  };

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      ...columns,
      ...statusColumns,
      editRecordsColumn,
    ]);
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: tableData,
      defaultColumn,
      filterTypes,
      initialState: {
        hiddenColumns: [
          'username',
          !isDashboard && 'description',
          !isDashboard && 'manager_display_name',
          isDashboard && 'physicalDeliveryOfficeName',
        ],
      },
    },
    useFilters,
    usePagination,
    tableHooks
  );

  const exportToExcel = () => {
    const excelRecords = tableData.map((row) => {
      const dayColumns = days.map((dayName, dayIdx) => {
        const day = addDays(selectedDate, dayIdx);
        const formattedDay = format(day, 'yyyy-MM-dd');
        const filteredRecord = records.filter(
          (record) =>
            record.record_date.slice(0, 10) == formattedDay &&
            record.username == row.username
        );
        if (filteredRecord.length !== 1) return null;
        if (!filteredRecord[0].user_status_id) return null;
        const statusId = filteredRecord[0].user_status_id;
        const userStatusObject = userStatuses.filter(
          (userStatus) => userStatus.user_status_id == statusId
        );
        const status = userStatusObject[0].user_status_name;
        return { [formattedDay + ' ' + dayName]: status };
      });

      let excelStatusColumns;
      for (let i = 0; i < dayColumns.length; i++) {
        excelStatusColumns = { ...excelStatusColumns, ...dayColumns[i] };
      }
      return {
        ...row,
        ...excelStatusColumns,
      };
    });

    var workBook = XLSX.utils.book_new();
    var workSheetRecords = XLSX.utils.json_to_sheet(excelRecords);
    XLSX.utils.book_append_sheet(workBook, workSheetRecords, 'Kayıtlar');
    XLSX.writeFile(
      workBook,
      `${format(
        selectedDate,
        'dd-MM-yyyy'
      )}-Haftalik-Personel-Devam-Kayitlari.xlsx`
    );
  };

  return (
    <>
      <div className={`overflow-x-auto overflow-y-visible text-xs`}>
        <div className='flex w-full items-center justify-between px-4 pb-4'>
          <h2 className='inline-flex gap-2 whitespace-nowrap rounded-md bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 '>
            {`
        ${format(selectedDate, 'd MMMM')}  -  ${format(
              addDays(selectedDate, 4),
              'd MMMM yyyy'
            )}`}
          </h2>
          <button
            onClick={exportToExcel}
            className='flex-end inline-flex gap-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-800'
          >
            <span>{"Excel'e Aktar"}</span>
            <span>
              <ArrowDownTrayIcon className='h-5 w-5' />
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
                    {...column.getHeaderProps({
                      style: { minWidth: column.minWidth, width: column.width },
                    })}
                    className='px-3 py-2 text-left align-baseline font-semibold first-of-type:pl-6 first-of-type:pr-3'
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
          <tbody {...getTableBodyProps()} className='text-gray-800'>
            {page.map((row, idx) => {
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
                        className='py-2 pl-3 pr-5 first-of-type:pl-6 first-of-type:pr-3 last-of-type:pl-5 '
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
        <div className='flex justify-end gap-6 p-6'>
          {/* <div className='flex w-20 flex-col gap-1'>
          <span className='whitespace-nowrap font-medium text-gray-600'>
          Sayfaya Git
          </span>
          <input
          type='number'
          defaultValue={pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            gotoPage(page);
          }}
          className='rounded-md py-2 px-3 text-gray-500 shadow focus:outline-blue-300'
          />
        </div> */}
          <div className='rounded-m flex items-center gap-2'>
            <div className='flex whitespace-nowrap text-sm font-medium text-gray-400'>
              Sayfa Boyutu
            </div>
            <select
              className='rounded-md bg-white py-2 px-1 text-sm font-medium text-gray-500 shadow focus:outline-blue-300'
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div></div>

          <div className='flex items-center justify-center gap-2.5'>
            <button
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
              className=' rounded-md bg-gray-50 p-2.5 text-gray-500 shadow hover:bg-blue-50  hover:text-blue-600 disabled:text-gray-300 disabled:shadow-none disabled:hover:bg-gray-50 disabled:hover:text-gray-300'
            >
              <ChevronDoubleLeftIcon className='h-4 w-4' />
            </button>
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className=' rounded-md bg-gray-50 p-2.5 text-gray-500 shadow hover:bg-blue-50  hover:text-blue-600 disabled:text-gray-300 disabled:shadow-none disabled:hover:bg-gray-50 disabled:hover:text-gray-300'
            >
              <ChevronLeftIcon className='h-4 w-4' />
            </button>

            <div className='rounded-md bg-white p-2 text-sm  font-semibold text-gray-400 focus:outline-blue-300'>
              <span className='flex gap-2 '>
                <span className='text-blue-600'>{`${pageIndex + 1}`}</span>
                <span>{`/`}</span>
                <span>{`${pageOptions.length}`}</span>
              </span>
            </div>

            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className=' rounded-md bg-gray-50 p-2.5 text-gray-500 shadow hover:bg-blue-50  hover:text-blue-600 disabled:text-gray-300 disabled:shadow-none disabled:hover:bg-gray-50 disabled:hover:text-gray-300'
            >
              <ChevronRightIcon className='h-4 w-4' />
            </button>
            <button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
              className=' rounded-md bg-gray-50 p-2.5 text-gray-500 shadow hover:bg-blue-50 hover:text-blue-600 disabled:text-gray-300 disabled:shadow-none disabled:hover:bg-gray-50 disabled:hover:text-gray-300'
            >
              <ChevronDoubleRightIcon className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>
      {editRecordsModalIsOpen ? (
        <EditRecordsModal
          isOpen={editRecordsModalIsOpen}
          setIsOpen={setEditRecordsModalIsOpen}
          selectedDate={selectedDate}
          userDataForEditRecordsModal={userDataForEditRecordsModal}
          userStatuses={userStatuses}
          records={records.filter(
            (record) => record.username === userDataForEditRecordsModal.username
          )}
          fetchTableData={fetchTableData}
        />
      ) : null}
    </>
  );
}

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  // const count = preFilteredRows.length;
  return (
    <input
      className='mt-1 rounded-md py-1 px-2 text-gray-500 shadow focus:outline-blue-300'
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
      className='mt-1 rounded-md py-1 px-2 text-gray-500 shadow focus:outline-blue-300'
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
