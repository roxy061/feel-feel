import mysql, { Pool, PoolOptions } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: Pool | undefined;
}

// ตรวจสอบการเปิดใช้งาน SSL สำหรับ Cloud Database (TiDB Cloud, Aiven, PlanetScale, AWS RDS)
const isSslEnabled =
  process.env.DB_SSL === "true" ||
  process.env.MYSQL_SSL === "true" ||
  process.env.TIDB_SSL === "true";

const poolConfig: PoolOptions = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.DB_PORT || process.env.MYSQL_PORT) || 3306,
  user: process.env.DB_USER || process.env.MYSQL_USER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || "3nfm_saas",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // รองรับ SSL สำหรับ Cloud Database เมื่อเปิดตัวแปร DB_SSL=true
  ssl: isSslEnabled
    ? {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        minVersion: "TLSv1.2",
      }
    : undefined,
};

// Reuse connection pool across hot reloads in development and serverless invocations
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
