import { addDays, format } from 'date-fns';
import { Transition } from '@headlessui/react';

export default function DailyStats({ records, userStatuses, selectedDate }) {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

  return (
    <div className='flex justify-between gap-4'>
      {days.map((dayName, dayIdx) => {
        const date = addDays(selectedDate, dayIdx);
        const formattedDate = format(date, 'dd-MM-yyyy');

        const dayStats = userStatuses.map((status) => {
          const count = records.reduce(
            (acc, record) =>
              acc +
              Boolean(
                record.user_status_id === status.user_status_id &&
                  record.record_date.slice(0, 10) === format(date, 'yyyy-MM-dd')
              ),
            0
          );
          return {
            user_status_id: status.user_status_id,
            user_status_name: status.user_status_name,
            count,
          };
        });

        const recordCount = dayStats.reduce(
          (acc, status) => acc + status.count,
          0
        );

        return (
          <div
            key={dayName}
            className='flex-1 rounded-lg border border-gray-200 bg-white text-sm text-gray-700'
          >
            <h3 className='flex justify-between border-b border-gray-200 px-4 py-2 font-medium'>
              <div>{dayName}</div>
              <div className='text-gray-300'>{formattedDate}</div>
            </h3>
            <Transition
              appear={true}
              show={true}
              enter='transition-opacity duration-500'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='transition-opacity duration-500'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <ul className='flex flex-col gap-2 p-4 text-xs'>
                {dayStats.map((status) => {
                  if (status.count === 0) return;
                  return (
                    <li
                      key={status.user_status_id}
                      className='flex items-center justify-between rounded-md border border-gray-200 pl-2'
                    >
                      <div className='py-1'>{status.user_status_name}</div>
                      <div className='ml-2 flex overflow-hidden rounded-md font-semibold tracking-wider '>
                        <div className=' whitespace-nowrap bg-gray-100 px-3 py-1 text-gray-600'>
                          {status.count}
                        </div>
                        <div className='w-16 whitespace-nowrap bg-gray-600 px-2 py-1 text-center text-white'>
                          {`% ${((100 * status.count) / recordCount).toFixed(
                            1
                          )}`}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Transition>
          </div>
        );
      })}
    </div>
  );
}
