import { dbConfig } from "./dbConfig";
const sql = require("mssql");

export async function addUser(user) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("username", sql.NVarChar, user.username)
      .input("display_name", sql.NVarChar, user.display_name)
      .input("mail", sql.NVarChar, user.mail)
      .input("is_manager", sql.Bit, user.is_manager)
      .input("is_hr", sql.Bit, user.is_hr)
      .input("user_dn", sql.NVarChar, user.user_dn)
      .input("title", sql.NVarChar, user.title)
      .input("description", sql.NVarChar, user.description)
      .input(
        "physicalDeliveryOfficeName",
        sql.NVarChar,
        user.physicalDeliveryOfficeName
      )
      .input("memberOf", sql.NVarChar, user.memberOf)
      .input("department", sql.NVarChar, user.department)
      .input("directReports", sql.NVarChar, user.directReports)
      .input("manager_dn", sql.NVarChar, user.manager_dn)
      .execute("PKDS.AddUser");
    console.log(result);
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
}

export async function getLoginInfo(username) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .execute("PKDS.GetLoginInfo");
    console.log(result);
    return result.recordset;
  } catch (err) {
    console.error(err);
    return err;
  }
}

export async function addOtp(code, username, createdAt) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("code", sql.NVarChar, code)
      .input("created_at", sql.DateTime2, createdAt)
      .execute("PKDS.AddOtp");
    console.log(result);
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
}

export async function getOtp(username) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .execute("PKDS.GetOtp");
    return result.recordset;
  } catch (err) {
    console.error(err);
    return err;
  }
}

export async function deleteOtp(username) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .execute("PKDS.DeleteOtp");
    return result.recordset;
  } catch (err) {
    console.error(err);
    return err;
  }
}
