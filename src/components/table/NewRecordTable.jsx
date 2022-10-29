import { useMemo, useRef, forwardRef, useEffect } from 'react';
import { useTable, useRowSelect } from 'react-table';
import StatusSelect from './StatusSelect';
import NewRecordBulkActions from './NewRecordBulkActions';

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

export default function NewRecordTable({ records, setRecords, userStatuses }) {
  const tableData = useMemo(
    () =>
      records[0].data.map((user) => ({
        username: user.username,
        display_name: user.display_name,
        user_status_id: user.user_status_id,
      })),
    []
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Personel',
        accessor: 'display_name',
      },
      {
        Header: '',
        accessor: 'username',
      },
    ],
    [records]
  );

  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  const selectBoxColumns = days.map((dayName, dayIdx) => ({
    id: dayIdx,
    Header: dayName,
    Cell: ({ row }) => {
      return (
        <StatusSelect
          selectedId={
            records
              .filter((records) => records.dayIdx === dayIdx)[0]
              .data.filter(
                (record) => record.username === row.values.username
              )[0].user_status_id
          }
          setRecords={setRecords}
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
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <div>
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          </div>
        ),
        Cell: ({ row }) => (
          <div>
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
    <>
      <div className='flex items-center justify-end p-4'>
        <NewRecordBulkActions
          records={records}
          setRecords={setRecords}
          userStatuses={userStatuses}
          selectedFlatRows={selectedFlatRows}
          numberOfSelectedRows={Object.keys(selectedRowIds).length}
        />
      </div>
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
                    className='whitespace-nowrap px-3 py-3 text-left align-bottom font-semibold first-of-type:pl-6'
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
                        {...cell.getCellProps()}
                        className='py-3 pl-3 pr-5 first-of-type:pl-6 '
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
    </>
  );
}

{
  /* <p>Selected Rows: {Object.keys(selectedRowIds).length}</p>
        <pre>
          <code>
            {JSON.stringify(
              {
                selectedRowIds: selectedRowIds,
                'selectedFlatRows[].original': selectedFlatRows.map(
                  (d) => d.original
                ),
              },
              null,
              2
            )}
          </code>
        </pre> */
}

// {
//   id: 'pazartesi',
//   Header: 'Pazartesi',
//   Cell: ({ row }) => {
//     return (
//       <StatusSelect
//         selectedId={
//           records
//             .filter((records) => records.dayIdx === 0)[0]
//             .data.filter(
//               (record) => record.username === row.values.username
//             )[0].user_status_id
//         }
//         setRecords={setRecords}
//         userStatuses={userStatuses}
//         username={row.values.username}
//         day={0}
//       />
//     );
//   },
// },

// {
//   id: 'sali',
//   Header: 'Salı',
//   Cell: ({ row }) => {
//     return (
//       <StatusSelect
//         selectedId={
//           records
//             .filter((records) => records.dayIdx === 1)[0]
//             .data.filter(
//               (record) => record.username === row.values.username
//             )[0].user_status_id
//         }
//         setRecords={setRecords}
//         userStatuses={userStatuses}
//         username={row.values.username}
//         day={1}
//       />
//     );
//   },
// },

// {
//   id: 'carsamba',
//   Header: 'Çarşamba',
//   Cell: ({ row }) => {
//     return (
//       <StatusSelect
//         selectedId={
//           records
//             .filter((records) => records.dayIdx === 2)[0]
//             .data.filter(
//               (record) => record.username === row.values.username
//             )[0].user_status_id
//         }
//         setRecords={setRecords}
//         userStatuses={userStatuses}
//         username={row.values.username}
//         day={2}
//       />
//     );
//   },
// },

// {
//   id: 'persembe',
//   Header: 'Perşembe',
//   Cell: ({ row }) => {
//     return (
//       <StatusSelect
//         selectedId={
//           records
//             .filter((records) => records.dayIdx === 3)[0]
//             .data.filter(
//               (record) => record.username === row.values.username
//             )[0].user_status_id
//         }
//         setRecords={setRecords}
//         userStatuses={userStatuses}
//         username={row.values.username}
//         day={3}
//       />
//     );
//   },
// },

// {
//   id: 'cuma',
//   Header: 'Cuma',
//   Cell: ({ row }) => {
//     return (
//       <StatusSelect
//         selectedId={
//           records
//             .filter((records) => records.dayIdx === 4)[0]
//             .data.filter(
//               (record) => record.username === row.values.username
//             )[0].user_status_id
//         }
//         setRecords={setRecords}
//         userStatuses={userStatuses}
//         username={row.values.username}
//         day={4}
//       />
//     );
//   },
// },
