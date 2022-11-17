import verifyToken from '../../../backend/verifyToken';
import sendMail from '../../../backend/sendMail';
import { addLog } from '../../../database/dbOps';

export default async function handler(req, response) {
  const userData = await verifyToken(req.headers.cookie);
  try {
    if (req.method !== 'POST') throw 'Http metodu POST olmalıdır.';

    if (userData.is_hr !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const { mailReceiver, mailSubject, mailTextField } = req.body;

    if (!mailReceiver) throw '"mailReceiver alanı zorunludur."';
    if (!mailSubject) throw '"mailSubject alanı zorunludur."';
    // if (!mailTextField) throw '"mailTextField" alanı zorunludur.';

    const content = `<p>${mailTextField}</p>`;

    const mailResult = await sendMail({
      mailTo: mailReceiver,
      subject: mailSubject,
      content,
    });

    if (mailResult.success !== true)
      throw mailResult.info
        ? JSON.stringify(mailResult.info)
        : 'E-posta gönderilemedi.';

    response.status(200).json({
      success: true,
      message: `E-posta ${mailReceiver} adresine başarıyla gönderildi.`,
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    response.status(200).json({ success: false, message: `${err}` });
    addLog({
      type: 'api',
      isError: true,
      username: userData.username || null,
      info: `api/mail/singe ${err}`,
    });
  }
}
