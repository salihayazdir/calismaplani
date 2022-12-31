import sendMail from '../backend/sendMail';
import { getUserStatuses } from '../database/dbOps';
import _ from 'lodash';

export default async function newRecordEmail({
  rawRecords,
  userData,
  prevRecordsExist,
  recordsStartDate,
  recordsEndDate,
}) {
  let mailContent;
  if (userData.isAuthorizedPersonnel) {
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
  if (userData.isAuthorizedPersonnel) {
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

  const usersInRecords = [
    ...new Set(
      rawRecords[0].data.map((record) => ({
        username: record.username,
        display_name: record.display_name,
        mail: record.mail,
      }))
    ),
  ];

  const userMailData = usersInRecords.map((user) => {
    const recordsOfUser = rawRecords.map((dayOfRecord) => {
      const recordOfUser = dayOfRecord.data.filter(
        (record) => record.username === user.username
      );
      return {
        dayIdx: dayOfRecord.dayIdx,
        dayDisplayName: dayOfRecord.dayDisplayName,
        statusOfDay: recordOfUser[0].user_status_id,
      };
    });
    return { ...user, records: _.sortBy(recordsOfUser, 'dayIdx') };
  });

  await getUserStatuses().then((userStatusesData) => {
    userMailData.forEach((mailDataOfUser) => {
      const sayin = `Sayın ${mailDataOfUser.display_name};<br/><br/>`;
      let entryDetails;
      if (userData.isAuthorizedPersonnel) {
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
