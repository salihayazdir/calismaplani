import verifyToken from '../../../../backend/verifyToken';
import { editTeamName, addLog } from '../../../../database/dbOps';

export default async function handler(req, response) {
  try {
    if (req.method !== 'PUT') throw 'HTTP metodu PUT olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);

    if (!userData) throw 'Kullanıcı bilgileriniz doğrulanamadı.';

    if (userData.is_manager !== true && userData.is_authorized !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const { teamId, teamDisplayName } = req.body;

    if (!teamId || !teamDisplayName)
      throw `"teamId" ve "teamDisplayName" alanları zorunludur.`;

    //////////////////////////////////////////////////////////////
    //                                                          //
    //      KONTROL EKLE:                                       //
    //      YÖNETİCİSİ OLUNMAYAN EKİP DÜZENLENEMESİN            //
    //                                                          //
    //////////////////////////////////////////////////////////////

    const editTeamNameRequest = await editTeamName({
      id: teamId,
      display_name: teamDisplayName,
    });
    if (editTeamNameRequest.success !== true)
      throw editTeamNameRequest.result || 'Database Error';

    response.status(200).json({
      success: true,
      message: `Ekip ismi değiştirildi.`,
      editedTeam: {
        name: teamDisplayName,
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
