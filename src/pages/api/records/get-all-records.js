import verifyToken from '../../../backend/verifyToken';
import { getAllRecordsByDate, addLog } from '../../../database/dbOps';
import { parse, isValid } from 'date-fns';

export default async function handler(req, response) {
  try {
    if (req.method !== 'POST') throw 'Http metodu POST olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);
    if (userData.is_hr !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const { startDate, endDate } = req.body;

    if (!startDate || !endDate)
      throw 'startDate ve endDate alanları zorunludur.';

    const parsedStartDate = parse(startDate, 'yyyy-MM-dd', new Date());
    const parsedEndDate = parse(endDate, 'yyyy-MM-dd', new Date());

    if (!isValid(parsedStartDate) || !isValid(parsedEndDate))
      throw 'Geçersiz tarih. Not: startDate ve endDate alanları yyyy-MM-dd formatında olmalıdır.';

    const records = await getAllRecordsByDate(startDate, endDate);

    response.status(200).json({
      success: true,
      message: 'ok',
      records,
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    response.status(500).json({ success: false, message: err });
    addLog({
      type: 'api',
      isError: true,
      username: userData.username || null,
      info: `api/records/get-all-records ${err}`,
    });
  }
}
