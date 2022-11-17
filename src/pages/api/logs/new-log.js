import verifyToken from '../../../backend/verifyToken';
import { addLog } from '../../../database/dbOps';

export default async function handler(req, response) {
  try {
    if (req.method !== 'POST') throw 'Http metodu POST olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);
    if (!userData) throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const { type, info } = req.body;

    if (!type) throw '"type" alanı zorunludur."';
    if (!info) throw '"info alanı zorunludur."';

    const result = await addLog({ type, info });

    if (result.success !== true) throw result.message || 'Log hatası.';

    response.status(200).json({
      success: true,
      message: result,
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    return response.status(200).json({ success: false, message: `${err}` });
  }
}
