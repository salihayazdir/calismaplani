export const dbConfig = {
  user:
    process.env.NODE_ENV === 'development'
      ? process.env.TEST_DB_USERNAME
      : process.env.PROD_DB_USERNAME,
  password:
    process.env.NODE_ENV === 'development'
      ? process.env.TEST_DB_PASSWORD
      : process.env.PROD_DB_PASSWORD,
  database:
    process.env.NODE_ENV === 'development'
      ? process.env.TEST_DB_NAME
      : process.env.PROD_DB_NAME,
  domain:
    process.env.NODE_ENV === 'development'
      ? process.env.TEST_DB_DOMAIN
      : process.env.PROD_DB_DOMAIN,
  server:
    process.env.NODE_ENV === 'development'
      ? process.env.TEST_DB_SERVER
      : process.env.PROD_DB_SERVER,
  trustServerCertificate: true,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};
