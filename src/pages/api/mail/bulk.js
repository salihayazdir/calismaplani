import verifyToken from '../../../backend/verifyToken';
import sendMail from '../../../backend/sendMail';
import { addLog } from '../../../database/dbOps';

export default async function handler(req, response) {
  const userData = await verifyToken(req.headers.cookie);
  try {
    if (req.method !== 'POST') throw 'Http metodu POST olmalıdır.';

    if (userData.is_hr !== true)
      throw 'Bu işlem için yetkiniz bulunmamaktadır.';

    const { mailReceivers, mailSubject, mailTextField } = req.body;

    if (!mailReceivers) throw '"mailReceivers alanı zorunludur."';
    if (!mailSubject) throw '"mailSubject alanı zorunludur."';
    // if (!mailTextField) throw '"mailTextField" alanı zorunludur.';

    const content = `<p>${mailTextField}</p>`;

    const mailResults = mailReceivers.map(
      async (receiver) =>
        await sendMail({
          mailTo: receiver,
          subject: mailSubject,
          content,
        })
    );

    const results = await Promise.allSettled(mailResults);

    const successfulMails = results.filter(
      (result) => result.status === 'fulfilled'
    );
    const errorMails = results.filter(
      (result) => result.status !== 'fulfilled'
    );

    const createResponseMessage = (results) => {
      if (results.length === successfulMails.length)
        return 'E-postalar başarıyla gönderildi.';
      if (successfulMails.length === 0)
        return `E-postalar gönderilemedi. Hata: ${
          errorMails[0].reason.response || 'Bağlantı hatası.'
        }`;
      return `${successfulMails.length} başarılı, ${
        errorMails.length
      } başarısız e-posta. Hata: ${
        errorMails[0].reason.response || 'Bağlantı hatası.'
      } `;
    };

    const responseData = {
      message: createResponseMessage(results),
      results: {
        successful: {
          count: successfulMails.length,
          data: successfulMails,
        },
        error: {
          count: errorMails.length,
          data: errorMails,
        },
      },
    };

    response.status(200).json({
      success: true,
      ...responseData,
    });

    if (errorMails.length !== 0) {
      addLog({
        type: 'bulkmail',
        isError: Boolean(successfulMails.length === 0),
        username: userData.username || null,
        info: `${JSON.stringify(responseData)}`,
      });
    }
  } catch (err) {
    console.error(`Error: ${err}`);
    response.status(200).json({ success: false, message: `${err}` });
    addLog({
      type: 'api',
      isError: true,
      username: userData.username || null,
      info: `api/mail/bulk ${err}`,
    });
  }
}
