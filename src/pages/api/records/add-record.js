import verifyToken from '../../../backend/verifyToken';
import { addRecord } from '../../../database/dbOps';

export default async function handler(req, response) {
  try {
    if (req.method !== 'POST') throw 'Http metodu POST olmalıdır.';
    const records = req.body.records;
    if (!records || !Array.isArray(records))
      throw 'Records alanı array içermelidir.';

    const userData = await verifyToken(req.headers.cookie);
    if (userData.is_manager === false)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const recordEntryResults = records.map(
      async (record) => await addRecord(record)
    );

    const results = await Promise.all(recordEntryResults);

    const successfulEntries = results.filter((result) => result.success);
    const errorEntries = results.filter((result) => !result.success);

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
  } catch (err) {
    console.error(`Error: ${err}`);
    return response.status(500).json({ success: false, message: err });
  }
}
