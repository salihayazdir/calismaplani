import verifyToken from '../../../../backend/verifyToken';
import {
  addLog,
  getMembersOfTeam,
  editTeamLeader,
} from '../../../../database/dbOps';

export default async function handler(req, response) {
  try {
    if (req.method !== 'PUT') throw 'HTTP metodu PUT olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);

    if (!userData) throw 'Kullanıcı bilgileriniz doğrulanamadı.';

    if (userData.is_manager !== true && userData.is_authorized !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const { teamId, teamLeaderUsername } = req.body;

    if (!teamId || !teamLeaderUsername)
      throw `"teamId" ve "teamLeaderUsername" alanları zorunludur.`;

    const membersOfTeamRequest = await getMembersOfTeam({ team_id: teamId });
    const membersOfTeam = membersOfTeamRequest.result.recordsets[0].map(
      (record) => record.username
    );

    if (membersOfTeam.indexOf(teamLeaderUsername) == -1)
      throw 'Atanmak istenen ekip lideri ekibin üyesi değil.';

    //////////////////////////////////////////////////////////////
    //                                                          //
    //      KONTROL EKLE:                                       //
    //      YÖNETİCİSİ OLUNMAYAN EKİP DÜZENLENEMESİN            //
    //                                                          //
    //////////////////////////////////////////////////////////////

    const editTeamLeaderRequest = await editTeamLeader({
      id: teamId,
      leader_username: teamLeaderUsername,
    });
    if (editTeamLeaderRequest.success !== true)
      throw editTeamLeaderRequest.result || 'Database Error';

    response.status(200).json({
      success: true,
      message: `Ekip lideri değiştirildi.`,
      editedTeam: {
        id: teamId,
        new_leader: teamLeaderUsername,
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
