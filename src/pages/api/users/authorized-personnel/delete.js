import verifyToken from '../../../../backend/verifyToken';
import sendMail from '../../../../backend/sendMail';
import {
  deleteAuthorizedPersonnel,
  getLoginInfo,
  addLog,
} from '../../../../database/dbOps';

export default async function handler(req, response) {
  const requestUsername = req.body.username;
  const userData = await verifyToken(req.headers.cookie);
  try {
    if (userData.is_manager !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    if (req.method !== 'DELETE') throw 'HTTP metodu DELETE olmalıdır.';
    if (!requestUsername) throw '"username" alanı zorunludur.';
    const requestedUserInfoRequest = await getLoginInfo(requestUsername);

    if (
      requestedUserInfoRequest.success !== true ||
      requestedUserInfoRequest.result.length !== 1
    )
      throw 'Kullanıcı bulunamadı.';
    const requestedUserInfo = requestedUserInfoRequest.result[0];

    if (requestedUserInfo.manager_username !== userData.username)
      throw 'Kullanıcının yöneticisi değilsiniz.';

    if (requestedUserInfo.is_manager === true)
      throw `${requestedUserInfo.display_name} isimli kullanıcı zaten yönetici.`;

    const deletedAuthorizedPersonnel = await deleteAuthorizedPersonnel(
      requestUsername
    );

    if (deletedAuthorizedPersonnel.success !== true)
      throw deletedAuthorizedPersonnel.result || 'Database Error';

    response.status(200).json({
      success: true,
      message: `${requestedUserInfo.display_name} isimli kullanıcının, yöneticisi ${userData.display_name} adına kayıt gönderme yetkisi kaldırılmıştır.`,
      deletedAuthorizedPersonnel: requestUsername,
    });

    sendMail({
      mailTo: requestedUserInfo.mail,
      subject: `Çalışma Planı | Yetki Tanımlaması`,
      content: `Yöneticiniz ${userData.display_name} tarafından haftalık personel devam kaydı girişi yetkiniz kaldırıldı.`,
    });

    sendMail({
      mailTo: userData.mail,
      subject: `Çalışma Planı | Yetki Tanımlaması`,
      content: `${requestedUserInfo.display_name} isimli personelin, adınıza haftalık personel devam kaydı girişi yetkisini kaldırdınız.`,
    });

    sendMail({
      mailTo: process.env.NOTIFICATION_MAIL,
      subject: `Çalışma Planı | Yetki Tanımlaması`,
      content: `Yönetici ${userData.display_name}, ${requestedUserInfo.display_name} isimli personelin haftalık personel devam kaydı girişi yetkisini kaldırdı.`,
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    response.status(200).json({ success: false, message: err });
    addLog({
      type: 'api',
      isError: true,
      username: userData.username || null,
      info: `api/users/authorized-personnel/delete ${err}`,
    });
  }
}
