import verifyToken from '../../../../backend/verifyToken';
import { addLog, getTeams } from '../../../../database/dbOps';

export default async function handler(req, response) {
  try {
    if (req.method !== 'GET') throw 'HTTP metodu GET olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);
    if (!userData) throw 'Kullanıcı bilgileriniz doğrulanamadı.';
    if (userData.is_manager !== true && userData.is_authorized !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const teamsRequest = await getTeams();
    const teamsData = teamsRequest.result.recordsets[0];

    response.status(200).json({
      success: true,
      teamsData,
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    response.status(200).json({ success: false, message: err });
    // addLog({
    //   type: 'api',
    //   isError: true,
    //   username: userData.username ? userData.username : null,
    //   info: `api/authorized-personnel/add ${err}`,
    // });
  }
}
