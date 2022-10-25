import { verify, decode } from 'jsonwebtoken';
import cookie from 'cookie';

export default async function verifyToken(tokenCookie) {
  const secret = process.env.JWT_SECRET;
  if (!tokenCookie) return false;

  const parsedCookie = cookie.parse(tokenCookie);
  const token = parsedCookie.token;

  try {
    const decodedToken = verify(token, secret);
    return decodedToken;
  } catch (err) {
    return false;
  }
}
