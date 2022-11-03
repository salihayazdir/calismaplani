import { useMemo } from 'react';
import { useTable, useFilters } from 'react-table';
import { addDays, format } from 'date-fns';
import * as XLSX from 'xlsx';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;
  return (
    <input
      className='mt-1 rounded-md py-1 px-2 text-gray-500 focus:outline-blue-300'
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
      className='mt-1 rounded-md py-1 px-2 text-gray-500 focus:outline-blue-300'
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

export default function DashboardTable({
  records,
  userStatuses,
  selectedDate,
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
      case 4:
        return 'bg-red-100 text-red-700 border border-red-300';
      default:
        return 'bg-gray-100';
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
        Cell: ({ value }) => (
          <span className=' text-gray-500'>{String(value)}</span>
        ),
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
        <div className='w-20 text-center'>
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
        initialState: { hiddenColumns: ['username'] },
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

    // const excelStats = days.map((dayName, dayIdx) => {
    //   const date = addDays(selectedDate, dayIdx);
    //   const formattedDate = format(date, 'yyyy-MM-dd');

    //   const dayStats = userStatuses.map((status) => {
    //     const count = records.reduce(
    //       (acc, record) =>
    //         acc +
    //         Boolean(
    //           record.user_status_id === status.user_status_id &&
    //             record.record_date.slice(0, 10) === formattedDate
    //         ),
    //       0
    //     );
    //     return {
    //       user_status_id: status.user_status_id,
    //       user_status_name: status.user_status_name,
    //       count,
    //     };
    //   });

    //   const recordCount = dayStats.reduce(
    //     (acc, status) => acc + status.count,
    //     0
    //   );

    //   console.log(dayStats);

    //   return dayStats.map((status) => {
    //     return {
    //       username: status.user_status_name,
    //       count: status.count,
    //       perc: ((100 * status.count) / recordCount).toFixed(1),
    //     };
    //     // <li
    //     //   key={status.user_status_id}
    //     //   className='flex items-center justify-between rounded-md border border-gray-200 pl-2'
    //     // >
    //     //   <div className='py-1'>{status.user_status_name}</div>
    //     //   <div className='ml-2 flex overflow-hidden rounded-md font-semibold tracking-wider '>
    //     //     <div className=' whitespace-nowrap bg-gray-600 px-3 py-1 text-gray-100'>
    //     //       {status.count}
    //     //     </div>
    //     //     <div className='whitespace-nowrap bg-gray-100 px-2 py-1 text-gray-600'>{`% ${(
    //     //       (100 * status.count) /
    //     //       recordCount
    //     //     ).toFixed(1)}`}</div>
    //     //   </div>
    //     // </li>
    //   });
    // });

    // console.log(excelStats);

    var workBook = XLSX.utils.book_new();
    var workSheetRecords = XLSX.utils.json_to_sheet(excelRecords);
    // var workSheetStats = XLSX.utils.json_to_sheet(excelStats);
    XLSX.utils.book_append_sheet(workBook, workSheetRecords, 'Kayıtlar');
    // XLSX.utils.book_append_sheet(workBook, workSheetStats, 'İstatistikler');
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
        <h2 className='rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 '>{`
        ${format(selectedDate, 'dd-MM-yyyy')}  /  ${format(
          addDays(selectedDate, 4),
          'dd-MM-yyyy'
        )} Tarihli Kayıtlar`}</h2>
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

// {
//         id: 'pazartesi',
//         Header: 'Pazartesi',
//         Cell: ({ row }) => {
//           const dayIdx = 0;
//           const day = addDays(selectedDate, dayIdx);
//           const formattedDay = format(day, 'yyyy-MM-dd');
//           const filteredRecord = records.filter(
//             (record) =>
//               record.record_date.slice(0, 10) == formattedDay &&
//               record.username == row.values.username
//           );
//           console.log(filteredRecord);
//           if (filteredRecord.length !== 1) return <div>no info</div>;
//           if (!filteredRecord[0].user_status_id) return <div>no info</div>;
//           const statusId = filteredRecord[0].user_status_id;
//           const userStatusObject = userStatuses.filter(
//             (userStatus) => userStatus.user_status_id == statusId
//           );
//           const status = userStatusObject[0].user_status_name;
//           return <div>{status}</div>;
//         },
//       },

//       {
//         id: 'sali',
//         Header: 'Salı',
//         Cell: ({ row }) => {
//           const dayIdx = 1;
//           const day = addDays(selectedDate, dayIdx);
//           const formattedDay = format(day, 'yyyy-MM-dd');
//           const filteredRecord = records.filter(
//             (record) =>
//               record.record_date.slice(0, 10) == formattedDay &&
//               record.username == row.values.username
//           );

//           if (filteredRecord.length !== 1) return <div>no info</div>;
//           if (!filteredRecord[0].user_status_id) return <div>no info</div>;
//           const statusId = filteredRecord[0].user_status_id;
//           const userStatusObject = userStatuses.filter(
//             (userStatus) => userStatus.user_status_id == statusId
//           );
//           const status = userStatusObject[0].user_status_name;
//           return <div>{status}</div>;
//         },
//       },

//       {
//         id: 'carsamba',
//         Header: 'Çarşamba',
//         Cell: ({ row }) => {
//           const dayIdx = 2;
//           const day = addDays(selectedDate, dayIdx);
//           const formattedDay = format(day, 'yyyy-MM-dd');
//           const filteredRecord = records.filter(
//             (record) =>
//               record.record_date.slice(0, 10) == formattedDay &&
//               record.username == row.values.username
//           );

//           if (filteredRecord.length !== 1) return <div>no info</div>;
//           if (!filteredRecord[0].user_status_id) return <div>no info</div>;
//           const statusId = filteredRecord[0].user_status_id;
//           const userStatusObject = userStatuses.filter(
//             (userStatus) => userStatus.user_status_id == statusId
//           );
//           const status = userStatusObject[0].user_status_name;
//           return <div>{status}</div>;
//         },
//       },

//       {
//         id: 'persembe',
//         Header: 'Perşembe',
//         Cell: ({ row }) => {
//           const dayIdx = 3;
//           const day = addDays(selectedDate, dayIdx);
//           const formattedDay = format(day, 'yyyy-MM-dd');
//           const filteredRecord = records.filter(
//             (record) =>
//               record.record_date.slice(0, 10) == formattedDay &&
//               record.username == row.values.username
//           );

//           if (filteredRecord.length !== 1) return <div>no info</div>;
//           if (!filteredRecord[0].user_status_id) return <div>no info</div>;
//           const statusId = filteredRecord[0].user_status_id;
//           const userStatusObject = userStatuses.filter(
//             (userStatus) => userStatus.user_status_id == statusId
//           );
//           const status = userStatusObject[0].user_status_name;
//           return <div>{status}</div>;
//         },
//       },

//       {
//         id: 'cuma',
//         Header: 'Cuma',
//         Cell: ({ row }) => {
//           const dayIdx = 4;
//           const day = addDays(selectedDate, dayIdx);
//           const formattedDay = format(day, 'yyyy-MM-dd');
//           const filteredRecord = records.filter(
//             (record) =>
//               record.record_date.slice(0, 10) == formattedDay &&
//               record.username == row.values.username
//           );

//           if (filteredRecord.length !== 1) return <div>no info</div>;
//           if (!filteredRecord[0].user_status_id) return <div>no info</div>;
//           const statusId = filteredRecord[0].user_status_id;
//           const userStatusObject = userStatuses.filter(
//             (userStatus) => userStatus.user_status_id == statusId
//           );
//           const status = userStatusObject[0].user_status_name;
//           return <div>{status}</div>;
//         },
//       },
