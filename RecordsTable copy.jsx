import { useMemo } from 'react';
import { useTable, useFilters } from 'react-table';
import { addDays, format } from 'date-fns';
import * as XLSX from 'xlsx';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function DashboardTable({
  records,
  userStatuses,
  selectedDate,
  isDashboard,
}) {
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
    }));
    const uniqUsersInRecords = removeDuplicateObjects(
      usersInRecords,
      JSON.stringify
    );
    return uniqUsersInRecords;
  }, [records]);

  const columns = useMemo(
    () => [
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
        Cell: ({ value }) => (
          <span className=' text-gray-500'>{String(value)}</span>
        ),
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
      if (filteredRecord.length !== 1) return <div>no data</div>;
      if (!filteredRecord[0].user_status_id) return <div>no data</div>;
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

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [...columns, ...statusColumns]);
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
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
          ],
        },
      },
      useFilters,
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
      <table {...getTableProps()} className='w-full border-collapse rounded-lg'>
        <thead className='border-y border-gray-200 bg-gray-50'>
          {headerGroups.map((headerGroup, idx) => (
            <tr key={idx} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, idx) => (
                <th
                  key={idx}
                  {...column.getHeaderProps()}
                  className='whitespace-nowrap px-3 py-2 text-left align-baseline font-semibold first-of-type:pl-10'
                >
                  {column.render('Header')}
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
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
                      className='py-2 pl-3 pr-5 first-of-type:pl-10 '
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
      <option value=''>Tüm Bölümler</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
