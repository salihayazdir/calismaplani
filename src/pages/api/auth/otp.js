import bcrypt from 'bcrypt';
import {
  getOtp,
  deleteOtp,
  getLoginInfo,
  addLog,
} from '../../../database/dbOps';
import cookie from 'cookie';

const jwt = require('jsonwebtoken');

export default async function handler(req, res) {
  const usernameFromRequest = req.body.username;
  const otpFromRequest = req.body.otp;
  try {
    const otpsFromDb = await getOtp(usernameFromRequest);
    if (otpsFromDb.length !== 1) throw 'Şifre bulunamadı.';

    const otpFromDb = otpsFromDb[0];
    const encryptedOtp = otpFromDb.code;
    const username = otpFromDb.username;
    const createdAt = otpFromDb.created_at;

    const match = bcrypt.compareSync(
      otpFromRequest,
      encryptedOtp,
      (err, result) => {
        // console.log(result);
      }
    );
    if (!match) throw 'Kod doğrulanamadı.';

    const loginInfoResult = await getLoginInfo(usernameFromRequest);
    if (loginInfoResult.success !== true || loginInfoResult.result.length !== 1)
      throw 'Kullanıcı bulunamadı.';

    const loginInfo = loginInfoResult.result[0];

    var currentTime = new Date();
    var tokenCreatedAt =
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

    const token = jwt.sign(
      { ...loginInfo, created_at: tokenCreatedAt },
      process.env.JWT_SECRET
    );

    if (Date.parse(createdAt) + 1000 * 60 * 3 < Date.now())
      throw 'Tek kullanımlık şifrenizin süresi dolmuştur.';

    deleteOtp(username);

    res
      .status(200)
      .setHeader(
        'Set-Cookie',
        cookie.serialize('token', token, {
          httpOnly: true,
          secure: false,
          maxAge: 24 * 60 * 60,
          sameSite: true,
          path: '/',
        })
      )
      .json({ success: true, username });

    addLog({
      type: 'api',
      isError: false,
      username: usernameFromRequest || null,
      info: `api/auth/otp`,
    });
  } catch (err) {
    console.error(err);
    res.status(200).json({ success: false, message: err });
    addLog({
      type: 'api',
      isError: true,
      username: usernameFromRequest || null,
      info: `api/auth/otp ${err}`,
    });
  }
}
