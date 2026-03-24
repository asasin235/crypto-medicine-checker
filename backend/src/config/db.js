const mysql = require("mysql2/promise.js");

let pool;

function buildPoolConfig() {
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "pharma_chain",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
  };
}

function isHealthcheckBypassed() {
  return process.env.NODE_ENV === "test" || process.env.DB_HEALTHCHECK_DISABLED === "true";
}

function getPool() {
  if (!pool) {
    pool = mysql.createPool(buildPoolConfig());
  }

  return pool;
}

async function getConnection() {
  const connection = await getPool().getConnection();
  return connection;
}

async function checkDatabaseHealth() {
  if (process.env.DB_HEALTH_STATUS) {
    return process.env.DB_HEALTH_STATUS;
  }

  if (isHealthcheckBypassed()) {
    return "connected";
  }

  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();
    return "connected";
  } catch (error) {
    return "disconnected";
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = {
  buildPoolConfig,
  checkDatabaseHealth,
  closePool,
  getConnection,
  getPool,
};
