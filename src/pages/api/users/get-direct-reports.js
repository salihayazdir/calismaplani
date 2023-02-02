import verifyToken from '../../../backend/verifyToken';
import {
  getDirectReports,
  getLoginInfo,
  addLog,
} from '../../../database/dbOps';

export default async function handler(req, response) {
  try {
    if (req.method !== 'GET') throw 'HTTP metodu GET olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);
    if (!userData) throw 'Kullanıcı bilgileriniz doğrulanamadı.';
    if (
      userData.is_manager !== true &&
      userData.is_authorized !== true &&
      userData.is_leader !== true
    )
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const managerUsernameFromRequest = req.query.managerUsername;
    if (!managerUsernameFromRequest)
      throw '"managerUsername" alanı zorunludur.';

    const managerUserDataRequest = await getLoginInfo(
      managerUsernameFromRequest
    );
    if (managerUserDataRequest.result.length !== 1)
      throw 'Kullanıcı bulunamadı.';

    // const managerUserData = managerUserDataRequest.result[0];

    // let directReportsManagerUsername;
    // if (managerUserData.is_manager === true) {
    //   directReportsManagerUsername = managerUserData.username;
    // } else {
    //   directReportsManagerUsername = managerUserData.manager_username;
    // }

    const directReports = await getDirectReports(managerUsernameFromRequest);

    response.status(200).json({
      success: true,
      directReports,
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
