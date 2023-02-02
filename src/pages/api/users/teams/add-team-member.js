import verifyToken from '../../../../backend/verifyToken';
import sendMail from '../../../../backend/sendMail';
import {
  addLog,
  getLoginInfo,
  getTeamOfUser,
  getMembersOfTeam,
  addTeamMember,
} from '../../../../database/dbOps';

export default async function handler(req, response) {
  try {
    if (req.method !== 'POST') throw 'HTTP metodu POST olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);

    if (!userData) throw 'Kullanıcı bilgileriniz doğrulanamadı.';

    if (userData.is_manager !== true && userData.is_authorized !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const { teamId, memberUsername } = req.body;

    if (!teamId || !memberUsername || typeof teamId !== 'number')
      throw `"teamId" ve "memberUsername" alanları zorunludur. "teamId" alanı "number" tipinde olmalıdır.`;

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

    const memberInfoRequest = await getLoginInfo(memberUsername);
    if (memberInfoRequest.result.length !== 1) throw 'Kullanıcı bulunamadı.';

    if (memberInfoRequest.result[0].is_manager)
      throw 'Yöneticiler ekip üyesi olarak atanamaz.';

    const checkIfUserIsInAnotherGroupRequest = await getTeamOfUser({
      username: memberUsername,
    });
    if (checkIfUserIsInAnotherGroupRequest.result.recordsets[0].length !== 0)
      throw 'Kullanıcı farklı bir ekipte.';

    const addTeamMemberRequest = await addTeamMember({
      team_id: teamId,
      username: memberUsername,
    });
    if (addTeamMemberRequest.success !== true)
      throw addTeamMemberRequest.result || 'Database Error';

    response.status(200).json({
      success: true,
      message: `Personel ekibe eklendi.`,
      newTeamMember: {
        team_id: teamId,
        username: memberUsername,
      },
    });

    // sendMail({
    //   mailTo: requestedUserInfo.mail,
    //   subject: `Çalışma Planı | Yetki Tanımlaması`,
    //   content: `Yöneticiniz ${userData.display_name} tarafından haftalık personel devam kaydı girişi için yetkilendirildiniz.`,
    // });

    // sendMail({
    //   mailTo: userData.mail,
    //   subject: `Çalışma Planı | Yetki Tanımlaması`,
    //   content: `${requestedUserInfo.display_name} isimli personeli, adınıza haftalık personel devam kaydı girişi için yetkilendirdiniz.`,
    // });

    // sendMail({
    //   mailTo: process.env.NOTIFICATION_MAIL,
    //   subject: `Çalışma Planı | Yetki Tanımlaması`,
    //   content: `Yönetici ${userData.display_name}, ${requestedUserInfo.display_name} isimli personeli haftalık personel devam kaydı girişi için yetkilendirdi.`,
    // });
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
