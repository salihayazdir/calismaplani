import verifyToken from '../../../../backend/verifyToken';
import sendMail from '../../../../backend/sendMail';
import { addTeam, addLog, getLoginInfo } from '../../../../database/dbOps';

export default async function handler(req, response) {
  try {
    if (req.method !== 'POST') throw 'HTTP metodu POST olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);

    if (!userData) throw 'Kullanıcı bilgileriniz doğrulanamadı.';

    if (userData.is_manager !== true && userData.is_authorized !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const { teamLeaderUsername, teamDisplayName } = req.body;
    let teamManagerUsername;

    if (!teamLeaderUsername || !teamDisplayName)
      throw `"teamLeaderUsername" ve "teamDisplayName" alanları zorunludur.`;

    //////////////////////////////////////////////////////////////
    //                                                          //
    //      KONTROL EKLE:                                       //
    //      YÖNETİCİSİ OLUNMAYAN EKİP DÜZENLENEMESİN            //
    //                                                          //
    //////////////////////////////////////////////////////////////

    if (userData.is_manager) {
      teamManagerUsername = userData.username;
    } else {
      teamManagerUsername = userData.manager_username;
    }

    const teamLeaderInfoRequest = await getLoginInfo(teamLeaderUsername);
    if (teamLeaderInfoRequest.result.length !== 1)
      throw 'Kullanıcı bulunamadı.';
    if (teamLeaderInfoRequest.result[0].is_manager)
      throw 'Yöneticiler ekip lideri olarak atanamaz.';

    const addTeamRequest = await addTeam({
      manager_username: teamManagerUsername,
      leader_username: teamLeaderUsername,
      display_name: teamDisplayName,
    });
    if (addTeamRequest.success !== true)
      throw addTeamRequest.result || 'Database Error';

    if (addTeamRequest.result.returnValue === 1)
      throw 'Kullanıcı başka bir ekipte.';

    response.status(200).json({
      success: true,
      message: `Ekip oluşturuldu.`,
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
