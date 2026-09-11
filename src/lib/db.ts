import mysql, { Pool, PoolOptions } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: Pool | undefined;
}

const poolConfig: PoolOptions = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "3nfm_saas",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Reuse connection pool across hot reloads in development
export const db: Pool =
  global.mysqlPool || mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  global.mysqlPool = db;
}

/**
 * Helper to run queries with automatic connection handling
 */
export async function query<T = any>(
  sql: string,
  values?: any[]
): Promise<T> {
  const [results] = await db.query(sql, values);
  return results as T;
}

export default db;
