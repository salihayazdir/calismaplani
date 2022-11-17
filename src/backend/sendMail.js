const nodemailer = require('nodemailer');

export default async function sendMail({ mailTo, subject, content }) {
  return new Promise((resolve, reject) => {
    try {
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
        // to: mailTo,
        to: 'salih.ayazdir@bilesim.net.tr',
        subject,
        html: content,
      };

      transport.sendMail(mailOptions, (err, info) => {
        if (err) {
          // console.log(err);
          reject(err);
        } else {
          // console.log(info);
          resolve({
            success: true,
            info,
          });
        }
      });
    } catch (err) {
      console.error(err);
      return {
        success: false,
        info: err,
      };
    }
  });
}
