import DatePicker from 'react-datepicker';
import { isSameISOWeek, startOfISOWeek, addDays, format } from 'date-fns';
import { forwardRef } from 'react';

export default function WeekPicker({
  selectedDate,
  setSelectedDate,
  minDate,
  maxDate,
}) {
  const CustomInput = forwardRef(({ value, onClick }, ref) => {
    return (
      <button
        className=' whitespace-nowrap rounded-r-lg px-4 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-500 hover:text-white'
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
      onChange={(date) => setSelectedDate(startOfISOWeek(date))}
      startDate={selectedDate}
      fixedHeight
      dateFormat='dd-MM-yyyy'
      calendarStartDay={1}
      minDate={minDate}
      maxDate={maxDate}
      nextMonthButtonLabel='>'
      previousMonthButtonLabel='<'
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
