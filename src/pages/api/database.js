const { Sequelize } = require("sequelize");

export default async function handler(req, res) {
  //   const sequelize = new Sequelize(process.env.DB_URL);

  const config = {
    host: process.env.DB_SERVER,
    dialect: "mssql",
    dialectOptions: {
      authentication: {
        type: "ntlm",
        options: {
          domain: process.env.DB_DOMAIN,
          userName: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
        },
      },
      options: {
        instanceName: process.env.DB_INSTANCE,
      },
    },
  };

  const sequelize = new Sequelize(process.env.DB_NAME, null, null, config);

  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  res.status(200).json({ test: "ok" });
}
