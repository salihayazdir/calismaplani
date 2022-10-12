import { addUser } from "../../database/dbOps";
export default async function handler(req, res) {
  addUser(req.body.user);
  res.status(200).json({ test: "ok" });
}
