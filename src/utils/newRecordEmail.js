import sendMail from '../backend/sendMail';
import { getUserStatuses } from '../database/dbOps';
import _ from 'lodash';
import {
  addDays,
  format,
  differenceInCalendarDays,
  parse,
  compareAsc,
} from 'date-fns';
import { setRevalidateHeaders } from 'next/dist/server/send-payload';

export default async function newRecordEmail({
  rawRecords,
  records,
  userData,
  prevRecordsExist,
  recordsStartDate,
  recordsEndDate,
}) {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

  let mailContent;
  if (userData.is_authorized) {
    mailContent = `${userData.display_name}, yöneticisi ${
      userData.manager_display_name
    } adına ${
      prevRecordsExist ? 'kayıtları düzenledi' : 'yeni kayıt girişi yaptı'
    }. Tarih aralığı: ${recordsStartDate} - ${recordsEndDate}`;
  } else {
    mailContent = `Yönetici ${userData.display_name} ${
      prevRecordsExist ? 'kayıtları düzenledi' : 'yeni kayıt girişi yaptı'
    }. Tarih aralığı: ${recordsStartDate} - ${recordsEndDate}`;
  }

  let mailSubject;
  if (userData.is_authorized) {
    mailSubject = `Çalışma Planı | ${
      prevRecordsExist ? 'Kayıt Düzenleme' : 'Yeni Kayıt'
    } | ${userData.display_name} (${userData.manager_display_name})`;
  } else {
    mailSubject = `Çalışma Planı | ${
      prevRecordsExist ? 'Kayıt Düzenleme' : 'Yeni Kayıt'
    } | ${userData.display_name}`;
  }

  sendMail({
    mailTo: process.env.NOTIFICATION_MAIL,
    subject: mailSubject,
    content: mailContent,
  });

  // const usersInRecords2 = [
  //   ...new Set(
  //     rawRecords[0].data.map((record) => ({
  //       username: record.username,
  //       display_name: record.display_name,
  //       mail: record.mail,
  //     }))
  //   ),
  // ];

  const usersInRecords = [
    ...new Set(
      records.map((record) =>
        JSON.stringify({
          username: record.username,
          display_name: record.mailData.display_name,
          mail: record.mailData.mail,
        })
      )
    ),
  ].map((user) => JSON.parse(user));

  // const userMailData = usersInRecords.map((user) => {
  //   const recordsOfUser = rawRecords.map((dayOfRecord) => {
  //     const recordOfUser = dayOfRecord.data.filter(
  //       (record) => record.username === user.username
  //     );
  //     return {
  //       dayIdx: dayOfRecord.dayIdx,
  //       dayDisplayName: dayOfRecord.dayDisplayName,
  //       statusOfDay: recordOfUser[0].user_status_id,
  //     };
  //   });
  //   return { ...user, records: _.sortBy(recordsOfUser, 'dayIdx') };
  // });

  const userMailData = usersInRecords.map((user) => {
    return {
      username: user.username,
      display_name: user.display_name,
      mail: null,
      records: days.map((day, idx) => {
        const recordsOfUser = records.filter(
          (record) => record.username === user.username
        );
        const recordDates = recordsOfUser
          .map((record) => parse(record.record_date, 'yyyy-MM-dd', new Date()))
          .sort(compareAsc);
        return {
          dayIdx: idx,
          dayDisplayName: day,
          statusOfDay: recordsOfUser[idx].user_status_id,
        };
      }),
    };
  });

  await getUserStatuses().then((userStatusesData) => {
    userMailData.forEach((mailDataOfUser) => {
      const sayin = `Sayın ${mailDataOfUser.display_name};<br/><br/>`;
      let entryDetails;
      if (userData.is_authorized) {
        entryDetails = `${userData.display_name}, ${
          userData.manager_display_name
        } adına ${
          prevRecordsExist
            ? 'haftalık çalışma planınızı düzenledi'
            : 'yeni haftalık çalışma planı kaydı oluşturdu'
        }.<br/><br/>Tarih aralığı: ${recordsStartDate} - ${recordsEndDate}</br><br/>`;
      } else {
        entryDetails = `${userData.display_name} ${
          prevRecordsExist
            ? 'haftalık çalışma planınızı düzenledi'
            : 'yeni haftalık çalışma planı kaydı oluşturdu'
        }.<br/><br/>Tarih aralığı: ${recordsStartDate} - ${recordsEndDate}</br><br/>`;
      }

      const recordDetails = mailDataOfUser.records
        .map((record) => {
          const statusDisplayName = userStatusesData.filter(
            (status) => status.user_status_id === record.statusOfDay
          )[0].user_status_name;
          return `${record.dayDisplayName}: ${statusDisplayName}`;
        })
        .join('<br/>')
        .toString();

      const userMailContent = sayin + entryDetails + recordDetails + '<br/>';

      const userMailSubject = 'Haftalık Çalışma Planınız';

      sendMail({
        mailTo: mailDataOfUser.mail,
        subject: userMailSubject,
        content: userMailContent,
      });
    });
  });
}
