const nodemailer = require("nodemailer");

export default async function sendMail({ mailTo, subject, html }) {
	let transport = nodemailer.createTransport({
		host: process.env.MAIL_HOST,
		secure: false,
		port: 587,
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PW,
		},
		tls: {
			rejectUnauthorized: false,
		},
	});

	const mailOptions = {
		from: process.env.MAIL_FROM,
		to: mailTo,
		subject,
		html,
	};

	let response = {};

	transport.sendMail(mailOptions, (err, info) => {
		if (err) {
			// console.log(err);
			response = {
				success: false,
				info: err,
			};
		} else {
			// console.log(info);
			response = {
				success: true,
				info,
			};
		}
	});

	return response;
}
