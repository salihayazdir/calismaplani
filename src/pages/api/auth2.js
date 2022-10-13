import bcrypt from "bcrypt";
const jwt = require("jsonwebtoken");

import { getOtp } from "../../database/dbOps";

export default async function handler(req, res) {
  const usernameFromRequest = req.body.username;
  const otpFromRequest = req.body.otp;
  try {
    const otpsFromDb = await getOtp(usernameFromRequest);
    if (otpsFromDb.length !== 1) throw "OTP not found.";

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

    const token = jwt.sign(tokenData, process.env.JWT_SECRET);

    if (Date.parse(createdAt) + 1000 * 60 * 5 < Date.now())
      throw "Tek kullanımlık şifrenizin süresi dolmuştur.";

    res.status(200).json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err });
  }
}
