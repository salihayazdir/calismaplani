const nodemailer = require('nodemailer');

export default async function sendMail({ mailTo, subject, content }) {
  return new Promise((resolve, reject) => {
    try {
      let transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        pool: true,
        secure: false,
        port: 25,
        // auth: {
        //   user: process.env.MAIL_USER,
        //   pass: process.env.MAIL_PW,
        // },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        // from: process.env.MAIL_FROM,
        from: 'Haftalık Çalışma Planı <calismaplani@bilesim.net.tr>',
        to:
          process.env.NODE_ENV === 'development'
            ? 'salih.ayazdir@bilesim.net.tr'
            : mailTo,
        subject,
        // html: content,
        html: `<div>${content}<br/><a href="https://calismaplani.bilesim.net.tr">calismaplani.bilesim.net.tr</a></div>`,
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
        transport.close();
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
