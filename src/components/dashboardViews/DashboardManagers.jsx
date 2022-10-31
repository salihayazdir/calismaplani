import React from 'react';
import Loader from '../Loader';
import ManagerUserTable from '../table/ManagerUserTable';

export default function DashboardManagers({
  listOfUsers,
  records,
  apiStatus,
  selectedDate,
}) {
  return (
    <>
      <div className='flex flex-col rounded-xl border border-gray-200 bg-white py-4'>
        {apiStatus.isLoading ? (
          <Loader />
        ) : (
          <ManagerUserTable
            listOfUsers={listOfUsers}
            records={records}
            selectedDate={selectedDate}
          />
        )}
      </div>
    </>
  );
}
