import { dbConfig } from "./dbConfig";
const sql = require("mssql");

export async function addUser(user) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("username", sql.VarChar, user.username)
      .input("display_name", sql.VarChar, user.display_name)
      .input("mail", sql.VarChar, user.mail)
      .input("is_manager", sql.Bit, user.is_manager)
      .input("is_hr", sql.Bit, user.is_hr)
      .input("user_dn", sql.VarChar, user.user_dn)
      .input("title", sql.VarChar, user.title)
      .input("description", sql.VarChar, user.description)
      .input(
        "physicalDeliveryOfficeName",
        sql.VarChar,
        user.physicalDeliveryOfficeName
      )
      .input("memberOf", sql.VarChar, user.memberOf)
      .input("department", sql.VarChar, user.department)
      .input("directReports", sql.VarChar, user.directReports)
      .input("manager_dn", sql.VarChar, user.manager_dn)
      .execute("PKDS.AddUser");
    console.log(result);
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
}
