import { useMemo } from 'react';
import { useTable } from 'react-table';
import { addDays, format } from 'date-fns';

export default function DashboardTable({
  records,
  userStatuses,
  selectedDate,
}) {
  console.log(userStatuses);
  // console.log(records);

  // const tableData = useMemo(
  //   () =>
  //     records.map((record) => ({
  //       record_id: record.record_id,
  //       display_name: record.display_name,
  //       manager_display_name: record.manager_display_name,
  //       record_date: record.record_date.slice(0, 10),
  //       user_status_id: record.user_status_id,
  //       username: record.username,
  //       manager_username: record.manager_username,
  //       record_status_id: record.record_status_id,
  //     })),
  //   [records]
  // );

  function removeDuplicateObjects(arr, fn) {
    var seen = {};
    return arr.filter((item) => {
      var k = fn(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  }

  const tableData = useMemo(() => {
    const usersInRecords = records.map((record) => ({
      display_name: record.display_name,
      manager_display_name: record.manager_display_name,
      username: record.username,
      manager_username: record.manager_username,
    }));
    const uniqUsersInRecords = removeDuplicateObjects(
      usersInRecords,
      JSON.stringify
    );
    return uniqUsersInRecords;
  }, [records, selectedDate]);

  const columns = useMemo(
    () => [
      {
        Header: 'Personel',
        accessor: 'display_name',
      },
      {
        Header: 'username',
        accessor: 'username',
      },
      {
        Header: 'Yönetici',
        accessor: 'manager_display_name',
      },
    ],
    []
  );

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      ...columns,
      {
        id: 'pazartesi',
        Header: 'Pazartesi',
        Cell: ({ row }) => {
          const dayIdx = 0;
          const day = addDays(selectedDate, dayIdx);
          const formattedDay = format(day, 'yyyy-MM-dd');
          const filteredRecord = records.filter(
            (record) =>
              record.record_date.slice(0, 10) == formattedDay &&
              record.username == row.values.username
          );
          console.log(filteredRecord);
          if (filteredRecord.length !== 1) return <div>no info</div>;
          if (!filteredRecord[0].user_status_id) return <div>no info</div>;
          const statusId = filteredRecord[0].user_status_id;
          const userStatusObject = userStatuses.filter(
            (userStatus) => userStatus.user_status_id == statusId
          );
          const status = userStatusObject[0].user_status_name;
          return <div>{status}</div>;
        },
      },

      {
        id: 'sali',
        Header: 'Salı',
        Cell: ({ row }) => {
          const dayIdx = 1;
          const day = addDays(selectedDate, dayIdx);
          const formattedDay = format(day, 'yyyy-MM-dd');
          const filteredRecord = records.filter(
            (record) =>
              record.record_date.slice(0, 10) == formattedDay &&
              record.username == row.values.username
          );

          if (filteredRecord.length !== 1) return <div>no info</div>;
          if (!filteredRecord[0].user_status_id) return <div>no info</div>;
          const statusId = filteredRecord[0].user_status_id;
          const userStatusObject = userStatuses.filter(
            (userStatus) => userStatus.user_status_id == statusId
          );
          const status = userStatusObject[0].user_status_name;
          return <div>{status}</div>;
        },
      },

      {
        id: 'carsamba',
        Header: 'Çarşamba',
        Cell: ({ row }) => {
          const dayIdx = 2;
          const day = addDays(selectedDate, dayIdx);
          const formattedDay = format(day, 'yyyy-MM-dd');
          const filteredRecord = records.filter(
            (record) =>
              record.record_date.slice(0, 10) == formattedDay &&
              record.username == row.values.username
          );

          if (filteredRecord.length !== 1) return <div>no info</div>;
          if (!filteredRecord[0].user_status_id) return <div>no info</div>;
          const statusId = filteredRecord[0].user_status_id;
          const userStatusObject = userStatuses.filter(
            (userStatus) => userStatus.user_status_id == statusId
          );
          const status = userStatusObject[0].user_status_name;
          return <div>{status}</div>;
        },
      },

      {
        id: 'persembe',
        Header: 'Perşembe',
        Cell: ({ row }) => {
          const dayIdx = 3;
          const day = addDays(selectedDate, dayIdx);
          const formattedDay = format(day, 'yyyy-MM-dd');
          const filteredRecord = records.filter(
            (record) =>
              record.record_date.slice(0, 10) == formattedDay &&
              record.username == row.values.username
          );

          if (filteredRecord.length !== 1) return <div>no info</div>;
          if (!filteredRecord[0].user_status_id) return <div>no info</div>;
          const statusId = filteredRecord[0].user_status_id;
          const userStatusObject = userStatuses.filter(
            (userStatus) => userStatus.user_status_id == statusId
          );
          const status = userStatusObject[0].user_status_name;
          return <div>{status}</div>;
        },
      },

      {
        id: 'cuma',
        Header: 'Cuma',
        Cell: ({ row }) => {
          const dayIdx = 4;
          const day = addDays(selectedDate, dayIdx);
          const formattedDay = format(day, 'yyyy-MM-dd');
          const filteredRecord = records.filter(
            (record) =>
              record.record_date.slice(0, 10) == formattedDay &&
              record.username == row.values.username
          );

          if (filteredRecord.length !== 1) return <div>no info</div>;
          if (!filteredRecord[0].user_status_id) return <div>no info</div>;
          const statusId = filteredRecord[0].user_status_id;
          const userStatusObject = userStatuses.filter(
            (userStatus) => userStatus.user_status_id == statusId
          );
          const status = userStatusObject[0].user_status_name;
          return <div>{status}</div>;
        },
      },
    ]);
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: tableData,
        initialState: { hiddenColumns: ['username'] },
      },
      tableHooks
    );

  return (
    <div className={`overflow-x-auto`}>
      <table
        {...getTableProps()}
        className='w-full border-collapse rounded-lg border-y border-gray-200'
      >
        <thead className='bg-gray-50 '>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  className='whitespace-nowrap px-3 py-4 text-center align-bottom font-semibold'
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className='text-gray-800'>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className='border-y border-gray-200'>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()} className='p-3'>
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
