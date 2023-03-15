import sendMail from '../backend/sendMail';
import { getUserStatuses, getLoginInfo } from '../database/dbOps';
import _ from 'lodash';
import parse from 'date-fns/parse';

export default async function newRecordEmail({
  // rawRecords,
  records,
  userData,
  prevRecordsExist,
  recordsStartDate,
  recordsEndDate,
}) {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

  const usersInRecords = [...new Set(records.map((record) => record.username))];

  const userMailDataRequests = await Promise.allSettled(
    usersInRecords.map(async (user) => {
      const userDataRequest = await getLoginInfo(user);
      if (userDataRequest.success !== true) return;
      return userDataRequest.result;
    })
  );

  const userMailData = userMailDataRequests.map((user) => {
    if (user.status !== 'fulfilled' || user.value.length !== 1) return;
    const userData = user.value[0];
    const recordsOfUser = records
      .filter((record) => record.username === userData.username)
      .sort(function (a, b) {
        return (
          parse(a.record_date, 'yyyy-MM-dd', new Date()) -
          parse(b.record_date, 'yyyy-MM-dd', new Date())
        );
      })
      .map((record, idx) => {
        return {
          dayIdx: idx,
          dayDisplayName: days[idx],
          statusOfDay: record.user_status_id,
        };
      });

    return {
      username: userData.username,
      display_name: userData.display_name,
      mail: userData.mail,
      records: recordsOfUser,
    };
  });

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

  let mailContent;
  if (userData.is_authorized) {
    mailContent = `${userData.display_name}, yöneticisi ${
      userData.manager_display_name
    } adına ${
      prevRecordsExist ? 'kayıtları düzenledi' : 'yeni kayıt girişi yaptı'
    }.<br/><br/>Tarih aralığı: ${recordsStartDate} - ${recordsEndDate}`;
  } else {
    mailContent = `${userData.display_name} ${
      prevRecordsExist ? 'kayıtları düzenledi' : 'yeni kayıt girişi yaptı'
    }.<br/><br/>Tarih aralığı: ${recordsStartDate} - ${recordsEndDate}`;
  }

  const updatedUsersContent =
    '<br/><br/>Güncellenen kullanıcılar:<br/>' +
    userMailData.map((user) => user.display_name).join('<br/>') +
    '<br/>';

  sendMail({
    mailTo: process.env.NOTIFICATION_MAIL,
    subject: mailSubject,
    content: mailContent + updatedUsersContent,
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
          const statusDisplayName = userStatusesData.find(
            (status) => status.user_status_id === record.statusOfDay
          ).user_status_name;
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
