const { Pool } = require("pg");

// Check if a cloud connection string is provided
const isProduction = process.env.NODE_ENV === "production";

// Create a connection pool for PostgreSQL
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
              connectionString: process.env.DATABASE_URL,
              ssl: isProduction ? { rejectUnauthorized: false } : false
          }
        : {
              host: process.env.DB_HOST,
              port: process.env.DB_PORT,
              database: process.env.DB_NAME,
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD
          }
);

module.exports = pool;
