import verifyToken from '../../../backend/verifyToken';
import sendMail from '../../../backend/sendMail';

export default async function handler(req, response) {
  try {
    if (req.method !== 'POST') throw 'Http metodu POST olmalıdır.';

    const userData = await verifyToken(req.headers.cookie);
    if (userData.is_hr !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const { mailReceivers, mailSubject, mailTextField } = req.body;

    if (!mailReceivers) throw '"mailReceivers alanı zorunludur."';
    if (!mailSubject) throw '"mailSubject alanı zorunludur."';
    // if (!mailTextField) throw '"mailTextField" alanı zorunludur.';

    const html = `<p>${mailTextField}</p>`;

    const mailResults = mailReceivers.map(
      async (receiver) =>
        await sendMail({
          mailTo: receiver,
          subject: mailSubject,
          html,
        })
    );

    const results = await Promise.all(mailResults);

    const successfulMails = results.filter((result) => result.success);
    const errorMails = results.filter((result) => !result.success);

    const createResponseMessage = (results) => {
      if (results.length === successfulMails.length)
        return 'Tüm kayıtlar başarıyla aktarıldı.';
      if (successfulMails.length === 0) return 'Kayıtlar aktarılamadı.';
      return `${successfulMails.length} başarılı, ${errorMails.length} başarısız kayıt.`;
    };

    response.status(200).json({
      success: true,
      message: createResponseMessage(results),
      results: {
        successful: {
          count: successfulEntries.length,
          data: successfulEntries,
        },
        error: {
          count: errorEntries.length,
          data: errorEntries,
        },
      },
    });
  } catch (err) {
    console.error(`Error: ${err}`);
    return response.status(200).json({ success: false, message: `${err}` });
  }
}
