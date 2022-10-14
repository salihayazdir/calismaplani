import bcrypt from "bcrypt";
import { getOtp, deleteOtp, getLoginInfo } from "../../../database/dbOps";
const jwt = require("jsonwebtoken");

export default async function handler(req, res) {
  const usernameFromRequest = req.body.username;
  const otpFromRequest = req.body.otp;
  try {
    const otpsFromDb = await getOtp(usernameFromRequest);
    if (otpsFromDb.length !== 1) throw "Şifre bulunamadı.";

    const otpFromDb = otpsFromDb[0];
    const encryptedOtp = otpFromDb.code;
    const username = otpFromDb.username;
    const createdAt = otpFromDb.created_at;

    const match = bcrypt.compareSync(
      otpFromRequest,
      encryptedOtp,
      (err, result) => {
        console.log(result);
      }
    );
    if (!match) throw "Kod doğrulanamadı.";

    const loginInfoArray = await getLoginInfo(usernameFromRequest);

    if (loginInfoArray.length !== 1) throw "Kullanıcı bulunamadı.";

    const tokenData = loginInfoArray[0];

    var currentTime = new Date();
    var tokenCreatedAt =
      currentTime.getFullYear() +
      "-" +
      (currentTime.getMonth() + 1) +
      "-" +
      currentTime.getDate() +
      " " +
      currentTime.getHours() +
      ":" +
      currentTime.getMinutes() +
      ":" +
      currentTime.getSeconds();

    const token = jwt.sign(
      { ...tokenData, created_at: tokenCreatedAt },
      process.env.JWT_SECRET
    );

    if (Date.parse(createdAt) + 1000 * 60 * 20 < Date.now())
      throw "Tek kullanımlık şifrenizin süresi dolmuştur.";

    deleteOtp(username);

    res.status(200).json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err });
  }
}
