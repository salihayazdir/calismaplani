import { verify, decode } from "jsonwebtoken";
export default async function verifyToken(token) {
	const secret = process.env.JWT_SECRET;
	if (!token) return false;

	try {
		const decodedToken = verify(token, secret);
		return decodedToken;
	} catch (err) {
		return false;
	}
}
