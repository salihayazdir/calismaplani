import verifyToken from '../../backend/verifyToken';
import sendMail from '../../backend/sendMail';

export default async function handler(req, response) {
  try {
    if (req.method !== 'POST') throw 'Http metodu POST olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);
    if (userData.is_hr === false)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const { mailReceiver, mailSubject, mailTextField } = req.body;

    if (!mailReceiver) throw '"mailReceiver alanı zorunludur."';
    if (!mailSubject) throw '"mailSubject alanı zorunludur."';
    // if (!mailTextField) throw '"mailTextField" alanı zorunludur.';

    const html = `<p>${mailTextField}</p>`;

    const mailResult = await sendMail({
      mailTo: mailReceiver,
      subject: mailSubject,
      html,
    });

    if (mailResult.success === false)
      throw mailResult.info
        ? JSON.stringify(mailResult.info)
        : 'E-posta gönderilemedi.';

    response.status(200).json({
      success: true,
      message: `E-posta ${mailReceiver} adresine başarıyla gönderildi.`,
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    return response.status(200).json({ success: false, message: `${err}` });
  }
}
