import { getLoginInfo, addOtp } from "../../../database/dbOps";
import sendMail from "../../../backend/sendMail";
import crypto from "node:crypto";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
	console.log(req.headers.cookie);
	try {
		const usernameFromRequest = req.body.username;
		const loginInfoArray = await getLoginInfo(usernameFromRequest);

		if (loginInfoArray.length !== 1) throw "Kullanıcı bulunamadı.";

		const loginInfo = loginInfoArray[0];

		if (loginInfo.is_hr === false && loginInfo.is_manager === false)
			throw "Sisteme giriş yetkiniz bulunmuyor.";

		const username = loginInfo.username;
		const usermail = loginInfo.mail;

		var currentTime = new Date();
		var createdAt =
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

		const randomNumber = crypto.randomInt(0, 1000000);
		const otp = randomNumber.toString().padStart(6, "0");

		bcrypt.hash(otp, 10, (err, hash) => {
			addOtp(hash, username, createdAt);
		});

		const mailInfo = await sendMail({
			mailTo: usermail,
			subject: "Bileşim PKDS | Kullanıcı Girişi",
			html: `<p>Tek Kullanımlık Şifreniz: ${otp}. Şifre geçerlilik süresi 3 dakikadır.<p>`,
		});

		if ((await mailInfo.success) === false)
			throw `Mailer Error: ${mailInfo.info || null}`;

		res.status(200).json({
			success: true,
			message: `Tek kullanımlık doğrulama kodunuz ${usermail} adresine gönderilmiştir.`,
			data: loginInfo,
		});
	} catch (err) {
		console.error(err);
		res.status(200).json({ success: false, message: err });
	}
}
