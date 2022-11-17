import verifyToken from '../../../../backend/verifyToken';
import {
  getAuthorizedPersonnelByManager,
  addLog,
} from '../../../../database/dbOps';

export default async function handler(req, response) {
  const userData = await verifyToken(req.headers.cookie);
  try {
    if (userData.is_manager !== true && userData.isAuthorizedPersonnel !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    if (req.method !== 'GET') throw 'HTTP metodu GET olmalıdır.';

    const authorizedPersonnelRequest = await getAuthorizedPersonnelByManager(
      userData.username
    );

    if (authorizedPersonnelRequest.success !== true)
      throw authorizedPersonnelRequest.result || 'Database Error';

    const authorizedPersonnel = authorizedPersonnelRequest.result.map(
      (user) => user.username
    );

    response.status(200).json({
      success: true,
      authorizedPersonnel,
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    response.status(200).json({ success: false, message: err });
    addLog({
      type: 'api',
      isError: true,
      username: userData.username || null,
      info: `api/users/authorized-personnel/get-by-manager ${err}`,
    });
  }
}
