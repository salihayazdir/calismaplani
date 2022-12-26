import verifyToken from '../../../../backend/verifyToken';
import { getAuthorizedPersonnel, addLog } from '../../../../database/dbOps';

export default async function handler(req, response) {
  const userData = await verifyToken(req.headers.cookie);
  try {
    if (userData.is_hr !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    if (req.method !== 'GET') throw 'HTTP metodu GET olmalıdır.';

    const authorizedPersonnel = await getAuthorizedPersonnel();
    if (authorizedPersonnel.success !== true)
      throw authorizedPersonnel.result || 'Database Error';

    response.status(200).json({
      success: true,
      authorizedPersonnel: authorizedPersonnel.result,
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    response.status(200).json({ success: false, message: err });
    addLog({
      type: 'api',
      isError: true,
      username: userData.username || null,
      info: `api/users/authorized-personnel/get-all ${err}`,
    });
  }
}
