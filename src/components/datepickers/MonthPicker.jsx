import DatePicker, { registerLocale } from 'react-datepicker';
import { isSameISOWeek, startOfMonth } from 'date-fns';
import tr from 'date-fns/locale/tr';
import { forwardRef } from 'react';

export default function MonthPicker({
  selectedDate,
  setSelectedDate,
  minDate,
  maxDate,
}) {
  registerLocale('tr', tr);
  const CustomInput = forwardRef(({ value, onClick }, ref) => {
    return (
      <button
        className='w-32 whitespace-nowrap rounded-r-lg px-4 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-600 hover:text-white '
        onClick={onClick}
        ref={ref}
      >
        {value}
      </button>
    );
  });
  CustomInput.displayName = 'CustomInput';

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date) => setSelectedDate(startOfMonth(date))}
      locale='tr'
      startDate={selectedDate}
      fixedHeight
      showMonthYearPicker
      dateFormat='MMMM yyyy'
      calendarStartDay={1}
      minDate={minDate}
      maxDate={maxDate}
      nextYearButtonLabel='>'
      previousYearButtonLabel='<'
      customInput={<CustomInput />}
      dayClassName={(date) =>
        isSameISOWeek(date, selectedDate)
          ? 'react-datepicker__day--selected'
          : ''
      }
      popperPlacement='top-end'
      popperModifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 4],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            rootBoundary: 'viewport',
            tether: false,
            altAxis: true,
          },
        },
      ]}
    />
  );
}
