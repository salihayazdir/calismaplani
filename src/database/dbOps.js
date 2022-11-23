import { dbConfig } from './dbConfig';
const sql = require('mssql');

export async function addUser(user) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('username', sql.NVarChar, user.username)
      .input('display_name', sql.NVarChar, user.display_name)
      .input('mail', sql.NVarChar, user.mail)
      .input('is_manager', sql.Bit, user.is_manager)
      .input('is_hr', sql.Bit, user.is_hr)
      .input('user_dn', sql.NVarChar, user.user_dn)
      .input('title', sql.NVarChar, user.title)
      .input('description', sql.NVarChar, user.description)
      .input(
        'physicalDeliveryOfficeName',
        sql.NVarChar,
        user.physicalDeliveryOfficeName
      )
      .input('memberOf', sql.NVarChar, user.memberOf)
      .input('department', sql.NVarChar, user.department)
      .input('directReports', sql.NVarChar, user.directReports)
      .input('manager_dn', sql.NVarChar, user.manager_dn)
      .execute('PKDS.AddUser');
    // console.log(result);
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
      .input('username', sql.NVarChar, username)
      .execute('PKDS.GetLoginInfo');
    // console.log(result);
    return {
      success: true,
      result: result.recordset,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      result: err,
    };
  }
}

export async function addOtp(code, username, createdAt) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('username', sql.NVarChar, username)
      .input('code', sql.NVarChar, code)
      .input('created_at', sql.DateTime2, createdAt)
      .execute('PKDS.AddOtp');
    // console.log(result);
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
      .input('username', sql.NVarChar, username)
      .execute('PKDS.GetOtp');
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
      .input('username', sql.NVarChar, username)
      .execute('PKDS.DeleteOtp');
    return result.recordset;
  } catch (err) {
    console.error(err);
    return err;
  }
}

export async function getDirectReports(manager_username) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('manager_username', sql.NVarChar, manager_username)
      .execute('PKDS.GetDirectReports');
    return result.recordset;
  } catch (err) {
    console.error(err);
    return err;
  }
}

export async function getUserStatuses() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute('PKDS.GetUserStatuses');
    return result.recordset;
  } catch (err) {
    console.error(err);
    return false;
    return err;
  }
}

export async function addRecord(record) {
  const { username, record_date, user_status_id, record_status_id } = record;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('username', sql.NVarChar, username)
      .input('record_date', sql.Date, record_date)
      .input('user_status_id', sql.Int, user_status_id)
      .input('record_status_id', sql.Int, record_status_id)
      .execute('PKDS.AddRecord');
    // console.log(result);
    return { success: true, message: 'Kayıt başarılı.', record };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: `${err.name}: ${err.message} Code: ${err.code}`,
      record,
    };
  }
}

export async function getAllRecordsByDate(startDate, endDate) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('start_date', sql.Date, startDate)
      .input('end_date', sql.Date, endDate)
      .execute('PKDS.GetAllRecordsByDate');
    return result.recordset;
  } catch (err) {
    console.error(err);
    return err;
  }
}

export async function getAllRecordsByDateByManager(
  startDate,
  endDate,
  managerUsername
) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('manager_username', sql.NVarChar, managerUsername)
      .input('start_date', sql.Date, startDate)
      .input('end_date', sql.Date, endDate)
      .execute('PKDS.GetAllRecordsByDateByManager');
    return result.recordset;
  } catch (err) {
    console.error(err);
    return err;
  }
}

export async function getUsersWithManagers() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute('PKDS.GetUsersWithManagers');
    return result.recordset;
  } catch (err) {
    console.error(err);
    return false;
    return err;
  }
}

export async function addLog({ type, info, username, isError }) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('type', sql.NVarChar, type)
      .input('info', sql.NVarChar, info)
      .input('username', sql.NVarChar, username)
      .input('is_error', sql.Bit, isError)
      .execute('PKDS.AddLog');
    // console.log(result);
    return { success: true, message: 'Log başarılı.' };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: `${err.name}: ${err.message} Code: ${err.code}`,
    };
  }
}

export async function getAuthorizedPersonnel() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute('PKDS.GetAuthorizedPersonnel');
    return {
      success: true,
      result: result.recordset,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      result: err,
    };
  }
}

export async function getAuthorizedPersonnelByManager(manager_username) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('manager_username', sql.NVarChar, manager_username)
      .execute('PKDS.GetAuthorizedPersonnelByManager');
    return {
      success: true,
      // result: result.recordset,
      result: result.recordset,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      result: err,
    };
  }
}

export async function addAuthorizedPersonnel({ username, manager_username }) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('username', sql.NVarChar, username)
      .input('manager_username', sql.NVarChar, manager_username)
      .execute('PKDS.AddAuthorizedPersonnel');
    // console.log(result);
    return {
      success: true,
      result,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      result: err,
    };
  }
}

export async function deleteAuthorizedPersonnel(username) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('username', sql.NVarChar, username)
      .execute('PKDS.DeleteAuthorizedPersonnel');
    // console.log(result);
    return {
      success: true,
      result,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      result: err,
    };
  }
}
