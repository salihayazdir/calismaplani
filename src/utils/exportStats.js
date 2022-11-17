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

    const startDate = format(selectedDate, 'dd-MM-yy');

    let endDate;
    if (selectedDateRange === 'day') endDate = '';
    if (selectedDateRange === 'week')
      endDate = format(addDays(selectedDate, 5), 'dd-MM-yy');
    if (selectedDateRange === 'month')
      endDate = format(endOfMonth(selectedDate), 'dd-MM-yy');

    return `${startDate}_${endDate}${
      selectedDateRange !== 'day' ? '_' : ''
    }${range}_Bolumler_Personel_Devam_Kayitlari.xlsx`;
  };

  const descriptions = [
    ...new Set(records.map((record) => record.description)),
  ];

  const divisionsData = descriptions.map((description, descriptionIdx) => {
    const statusCounts = userStatuses.map((status, statusIdx) => {
      const statusCount = records.reduce(
        (acc, record) =>
          acc +
          Boolean(
            record.user_status_id === status.user_status_id &&
              record.description === description
          ),
        0
      );
      return {
        [status.user_status_name]: statusCount,
      };
    });

    let statusColumns;
    for (let i = 0; i < statusCounts.length; i++) {
      statusColumns = { ...statusColumns, ...statusCounts[i] };
    }

    const personnelCount = [
      ...new Set(
        records
          .filter((record) => record.description === description)
          .map((record) => record.username)
      ),
    ].length;

    return {
      Bölüm: description,
      Personel_Sayısı: personnelCount,
      ...statusColumns,
    };
  });

  const totalPersonnelCount = divisionsData.reduce(
    (acc, division) => acc + division.Personel_Sayısı,
    0
  );

  const totalStatusCounts = userStatuses.map((status, statusIdx) => {
    const count = divisionsData.reduce(
      (acc, division) => acc + division[status.user_status_name],
      0
    );
    return {
      [status.user_status_name]: count,
    };
  });

  // const totalStatusCounts = userStatuses.map((status, statusIdx) => {
  //   const count = records.reduce(
  //     (acc, record) =>
  //       acc + Boolean(record.user_status_id === status.user_status_id),
  //     0
  //   );
  //   return {
  //     [status.user_status_name]: count,
  //   };
  // });

  let totalsRowColumns;
  for (let i = 0; i < totalStatusCounts.length; i++) {
    totalsRowColumns = { ...totalsRowColumns, ...totalStatusCounts[i] };
  }

  const totalsRow = {
    Bölüm: 'Toplam',
    Personel_Sayısı: totalPersonnelCount,
    ...totalsRowColumns,
  };

  const excelData = [...divisionsData, totalsRow];

  var workBook = XLSX.utils.book_new();
  var workSheetRecords = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(workBook, workSheetRecords, 'Bölümler');
  XLSX.writeFile(workBook, getFileName());
}
