import verifyToken from '../../../../backend/verifyToken';
import {
  addLog,
  deleteTeam,
  getMembersOfTeam,
} from '../../../../database/dbOps';

export default async function handler(req, response) {
  try {
    if (req.method !== 'DELETE') throw 'HTTP metodu DELETE olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);

    if (!userData) throw 'Kullanıcı bilgileriniz doğrulanamadı.';

    if (userData.is_manager !== true && userData.is_authorized !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const { teamId } = req.body;

    if (!teamId) throw `"teamId" alanı zorunludur.`;

    //////////////////////////////////////////////////////////////
    //                                                          //
    //      KONTROL EKLE:                                       //
    //      YÖNETİCİSİ OLUNMAYAN EKİP DÜZENLENEMESİN            //
    //                                                          //
    //////////////////////////////////////////////////////////////

    const checkIfTeamExistsRequest = await getMembersOfTeam({
      team_id: teamId,
    });
    if (checkIfTeamExistsRequest.result.returnValue == 1)
      throw 'Ekip bulunamadı.';

    const deleteTeamRequest = await deleteTeam({
      id: teamId,
    });
    if (deleteTeamRequest.success !== true)
      throw deleteTeamRequest.result || 'Database Error';

    response.status(200).json({
      success: true,
      message: `Ekip kaldırıldı.`,
      deletedTeam: {
        id: teamId,
      },
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
