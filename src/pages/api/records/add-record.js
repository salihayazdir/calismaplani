import sendMail from '../../../backend/sendMail';
import verifyToken from '../../../backend/verifyToken';
import { addRecord, addLog } from '../../../database/dbOps';
import newRecordEmail from '../../../utils/newRecordEmail';

export default async function handler(req, response) {
  try {
    if (req.method !== 'POST') throw 'Http metodu POST olmalıdır.';
    const records = req.body.records;
    // const rawRecords = req.body.rawRecords;
    const recordsStartDate = req.body.recordsStartDate;
    const recordsEndDate = req.body.recordsEndDate;
    const prevRecordsExist = req.body.prevRecordsExist;

    if (!records || !Array.isArray(records))
      throw 'Records alanı array içermelidir.';

    if (!recordsStartDate) throw '"recordsStartDate" alanı zorunludur.';
    if (!recordsEndDate) throw '"recordsEndDate" alanı zorunludur.';
    if (prevRecordsExist !== true && prevRecordsExist !== false)
      throw '"prevRecordsExist" alanı zorunludur ve veri tipi "Boolean" olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);
    // if (userData.is_manager !== true)
    //   throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const recordEntryResults = records.map(
      async (record) => await addRecord(record)
    );

    const results = await Promise.allSettled(recordEntryResults);

    const successfulEntries = results.filter(
      (result) => result.status === 'fulfilled' && result.value.success === true
    );
    const errorEntries = results.filter(
      (result) => result.status !== 'fulfilled' || result.value.success !== true
    );

    const createResponseMessage = (results) => {
      if (results.length === successfulEntries.length)
        return 'Tüm kayıtlar başarıyla aktarıldı.';
      if (successfulEntries.length === 0) return 'Kayıtlar aktarılamadı.';
      return `${successfulEntries.length} başarılı, ${errorEntries.length} başarısız kayıt.`;
    };

    response.status(200).json({
      success: true,
      message: createResponseMessage(results),
      results: {
        successful: {
          count: successfulEntries.length,
          data: successfulEntries,
        },
        error: {
          count: errorEntries.length,
          data: errorEntries,
        },
      },
    });

    newRecordEmail({
      // rawRecords,
      records,
      userData,
      prevRecordsExist,
      recordsStartDate,
      recordsEndDate,
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    response.status(500).json({ success: false, message: err });
    addLog({
      type: 'api',
      isError: true,
      username: userData.username || null,
      info: `api/records/add-record ${err}`,
    });
  }
}
