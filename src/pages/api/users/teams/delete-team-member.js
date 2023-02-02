import verifyToken from '../../../../backend/verifyToken';
import sendMail from '../../../../backend/sendMail';
import {
  addLog,
  getLoginInfo,
  getTeamOfUser,
  deleteTeamMember,
} from '../../../../database/dbOps';

export default async function handler(req, response) {
  try {
    if (req.method !== 'DELETE') throw 'HTTP metodu DELETE olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);

    if (!userData) throw 'Kullanıcı bilgileriniz doğrulanamadı.';

    if (userData.is_manager !== true && userData.is_authorized !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const { memberUsername } = req.body;

    if (!memberUsername) throw `"memberUsername" alanı zorunludur.`;

    //////////////////////////////////////////////////////////////
    //                                                          //
    //      KONTROL EKLE:                                       //
    //      YÖNETİCİSİ OLUNMAYAN EKİP DÜZENLENEMESİN            //
    //                                                          //
    //////////////////////////////////////////////////////////////

    const memberInfoRequest = await getLoginInfo(memberUsername);
    if (memberInfoRequest.result.length !== 1) throw 'Kullanıcı bulunamadı.';

    const addTeamMemberRequest = await deleteTeamMember({
      username: memberUsername,
    });
    if (addTeamMemberRequest.success !== true)
      throw addTeamMemberRequest.result || 'Database Error';

    response.status(200).json({
      success: true,
      message: `Personel ekipten çıkarıldı.`,
      deletedTeamMember: {
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
