import {
  getLoginInfo,
  addOtp,
  getAuthorizedPersonnel,
  addLog,
} from '../../../database/dbOps';
import sendMail from '../../../backend/sendMail';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  const usernameFromRequest = req.body.username;
  try {
    const loginInfoResult = await getLoginInfo(usernameFromRequest);

    if (loginInfoResult.result.code === 'ESOCKET') throw 'Bağlantı hatası.';

    if (loginInfoResult.success !== true || loginInfoResult.result.length !== 1)
      throw 'Kullanıcı bulunamadı.';

    const loginInfo = loginInfoResult.result[0];

    const checkIsAuthorized = async () => {
      const authorizedPersonnel = await getAuthorizedPersonnel();
      const authorizedPersonnelUsernames = authorizedPersonnel.result.map(
        (user) => user.username
      );
      const isAuthorizedPersonnel = Boolean(
        authorizedPersonnelUsernames.indexOf(loginInfo.username) !== -1
      );
      return isAuthorizedPersonnel;
    };

    if (loginInfo.is_hr === false && loginInfo.is_manager === false) {
      const authorizedCheckResult = await checkIsAuthorized();
      if (authorizedCheckResult !== true)
        throw 'Sisteme giriş yetkiniz bulunmuyor.';
    }

    const username = loginInfo.username;
    const usermail = loginInfo.mail;

    var currentTime = new Date();
    var createdAt =
      currentTime.getFullYear() +
      '-' +
      (currentTime.getMonth() + 1) +
      '-' +
      currentTime.getDate() +
      ' ' +
      currentTime.getHours() +
      ':' +
      currentTime.getMinutes() +
      ':' +
      currentTime.getSeconds();

    const randomNumber = crypto.randomInt(0, 1000000);
    const otp = randomNumber.toString().padStart(6, '0');

    bcrypt.hash(otp, 10, (err, hash) => {
      addOtp(hash, username, createdAt);
    });

    const mailInfo = await sendMail({
      mailTo: usermail,
      subject: 'Bileşim PKDS | Kullanıcı Girişi',
      content: `<p>Tek Kullanımlık Şifreniz: ${otp}. Şifre geçerlilik süresi 3 dakikadır.<p>`,
    });

    if ((await mailInfo.success) !== true)
      throw `Mailer Error: ${mailInfo.info || null}`;

    res.status(200).json({
      success: true,
      message: `Tek kullanımlık doğrulama kodunuz ${usermail} adresine gönderilmiştir.`,
      data: loginInfo,
    });
  } catch (err) {
    console.error(err);
    res.status(200).json({ success: false, message: err });
    addLog({
      type: 'api',
      isError: true,
      username: usernameFromRequest || null,
      info: `api/auth/login ${err}`,
    });
  }
}
