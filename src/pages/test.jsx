import React from 'react';
import { getUsersWithManagers } from '../database/dbOps';
import { ldapData } from '../ldapData';

export default function test({ listOfUsers }) {
  // const data = ldapData.filter((user) => user.sAMAccountName.length !== 6);
  //   const data = ldapData.filter(
  //     (user) => user.mail === null || user.mail === undefined
  //   );

  // const departments = [...new Set(listOfUsers.map((user) => user.description))];
  // const personnelCountByDepartment = departments.map((department) => {
  //   const count = listOfUsers.reduce((acc, user) => {
  //     if (user.description === department) return acc + 1;
  //     return acc;
  //   }, 0);
  //   return {
  //     name: department,
  //     count,
  //   };
  // });

  const includes = (str, subStr) => {
    return Boolean(str.toLowerCase().includes(subStr.toLowerCase()));
  };

  const sort = (objArray) => {
    return objArray.sort(function (a, b) {
      var textA = a.display_name.toUpperCase();
      var textB = b.display_name.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });
  };

  return (
    <div className='flex w-full gap-10 p-10'>
      <div className='flex flex-col gap-10 p-10'>
        <h1 className=' text-lg font-bold'>DB</h1>
        {/* <ul className='flex flex-col gap-2 divide-y text-xs'>
          {personnelCountByDepartment.map((department) => (
            <li className='flex justify-between'>
              <span className=''>{`${department.name}`}</span>
              <span className='font-bold'>{`${department.count}`}</span>
            </li>
          ))}
        </ul> */}
        {sort(
          listOfUsers.filter((user) =>
            includes(String(user.display_name), 'fahri ç')
          )
        ).map((user, idx) => {
          return (
            <div className='text-xs'>
              <div>{idx + 1}</div>
              <div className='font-bold'>{`${user.display_name}`}</div>
              <div>{`${user.username}`}</div>
              <div>{`departman: ${user.department}`}</div>
              <div>{`bölüm: ${user.description}`}</div>
              <div>{`manager: ${user.manager_display_name}`}</div>
            </div>
          );
        })}
      </div>
      {/* <div className='flex w-1/2 flex-col gap-10 p-10'>
        <h1 className=' text-lg font-bold'>LDAP</h1>
        {data.map((user, idx) => {
          return (
            <div className='text-xs'>
              <div>{idx + 1}</div>
              <div className='font-bold'>{`${user.cn}`}</div>
              <div>{`${user.sAMAccountName}`}</div>
              <div>{`departman: ${user.department}`}</div>
              <div>{`bölüm: ${user.description}`}</div>
              <div>{`servis: ${user.physicalDeliveryOfficeName}`}</div>
              <div>{`manager: ${user.manager}`}</div>
              <div>{`directReports: ${user.directReports}`}</div>
            </div>
          );
        })}
      </div> */}
    </div>
  );
}

export async function getServerSideProps(context) {
  const listOfUsers = await getUsersWithManagers();

  return {
    props: { listOfUsers },
  };
}
