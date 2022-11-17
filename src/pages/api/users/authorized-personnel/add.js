import verifyToken from '../../../../backend/verifyToken';
import sendMail from '../../../../backend/sendMail';
import {
  addAuthorizedPersonnel,
  getLoginInfo,
  addLog,
} from '../../../../database/dbOps';

export default async function handler(req, response) {
  const requestUsername = req.body.username;

  try {
    const userData = await verifyToken(req.headers.cookie);
    if (userData.is_manager !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    if (req.method !== 'POST') throw 'HTTP metodu POST olmalıdır.';
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

    const newAuthorizedPersonnel = await addAuthorizedPersonnel({
      username: requestUsername,
      manager_username: userData.username,
    });
    if (newAuthorizedPersonnel.success !== true)
      throw newAuthorizedPersonnel.result || 'Database Error';

    response.status(200).json({
      success: true,
      message: `${requestedUserInfo.display_name} isimli kullanıcıya, yöneticisi ${userData.display_name} adına kayıt gönderme yetkisi tanımlanmıştır.`,
      newAuthorizedPersonnel: requestUsername,
    });

    sendMail({
      mailTo: requestedUserInfo.mail,
      subject: `PKDS | Yetki Tanımlaması`,
      content: `Yöneticiniz ${userData.display_name} tarafından haftalık personel devam kaydı girişi için yetkilendirildiniz.`,
    });

    sendMail({
      mailTo: userData.mail,
      subject: `PKDS | Yetki Tanımlaması`,
      content: `${requestedUserInfo.display_name} isimli personeli, adınıza haftalık personel devam kaydı girişi için yetkilendirdiniz.`,
    });

    sendMail({
      mailTo: process.env.NOTIFICATION_MAIL,
      subject: `PKDS | Yetki Tanımlaması`,
      content: `Yönetici ${userData.display_name}, ${requestedUserInfo.display_name} isimli personeli haftalık personel devam kaydı girişi için yetkilendirdi.`,
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    response.status(200).json({ success: false, message: err });
    addLog({
      type: 'api',
      isError: true,
      username: userData.username || null,
      info: `api/authorized-personnel/add ${err}`,
    });
  }
}
