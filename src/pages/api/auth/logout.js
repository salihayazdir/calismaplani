import cookie from 'cookie';

export default async function handler(req, res) {
  try {
    res
      .status(200)
      .setHeader(
        'Set-Cookie',
        cookie.serialize('token', '', {
          httpOnly: true,
          secure: false,
          expires: new Date(0),
          sameSite: true,
          path: '/',
        })
      )
      .json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(200).json({ success: false, message: err });
  }
}
