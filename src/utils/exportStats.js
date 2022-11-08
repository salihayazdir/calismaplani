import { addDays, format, endOfMonth } from 'date-fns';
import * as XLSX from 'xlsx';

export default function exportStats({
  records,
  userStatuses,
  selectedDateRange,
  selectedDate,
}) {
  const getFileName = () => {
    let range;
    if (selectedDateRange === 'day') range = 'Günlük';
    if (selectedDateRange === 'week') range = 'Haftalık';
    if (selectedDateRange === 'month') range = 'Aylık';

    const startDate = format(selectedDate, 'dd_MM_yy');

    let endDate;
    if (selectedDateRange === 'day') endDate = '';
    if (selectedDateRange === 'week')
      endDate = format(addDays(selectedDate, 5), 'dd_MM_yy');
    if (selectedDateRange === 'month')
      endDate = format(endOfMonth(selectedDate), 'dd_MM_yy');

    return `${startDate}-${endDate}${
      selectedDateRange !== 'day' ? '-' : ''
    }${range}-Bolumler-Personel-Devam-Kayitlari.xlsx`;
  };

  const descriptions = [
    ...new Set(records.map((record) => record.description)),
  ];

  const divisionsData = descriptions.map((description, descriptionIdx) => {
    const statusCounts = userStatuses.map((status, statusIdx) => {
      const count = records.reduce(
        (acc, record) =>
          acc +
          Boolean(
            record.user_status_id === status.user_status_id &&
              record.description === description
          ),
        0
      );
      return {
        [status.user_status_name]: count,
      };
    });

    let statusColumns;
    for (let i = 0; i < statusCounts.length; i++) {
      statusColumns = { ...statusColumns, ...statusCounts[i] };
    }

    return {
      Bölüm: description,
      ...statusColumns,
    };
  });

  const totalStatusCounts = userStatuses.map((status, statusIdx) => {
    const count = records.reduce(
      (acc, record) =>
        acc + Boolean(record.user_status_id === status.user_status_id),
      0
    );
    return {
      [status.user_status_name]: count,
    };
  });
  let totalsRowColumns;
  for (let i = 0; i < totalStatusCounts.length; i++) {
    totalsRowColumns = { ...totalsRowColumns, ...totalStatusCounts[i] };
  }

  const totalsRow = { Bölüm: 'Toplam', ...totalsRowColumns };

  const excelData = [totalsRow, ...divisionsData];
  console.log(excelData);

  var workBook = XLSX.utils.book_new();
  var workSheetRecords = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(workBook, workSheetRecords, 'Bölümler');
  XLSX.writeFile(workBook, getFileName());
}
